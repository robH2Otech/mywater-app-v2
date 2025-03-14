
import { toast } from "@/components/ui/use-toast";
import { doc, getDoc, addDoc, collection, DocumentData } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";
import { 
  generateReportContent, 
  fetchMeasurementsForReport,
  calculateMetricsFromMeasurements
} from "@/utils/reportGenerator";

export async function handleReportGeneration(
  selectedUnit: string, 
  reportType: string,
  setIsGenerating: (value: boolean) => void,
  onReportGenerated: () => void
) {
  if (!selectedUnit || !reportType) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Please select a unit and report type",
    });
    return;
  }

  setIsGenerating(true);
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("No authenticated session");
    }

    // Fetch unit data
    const unitDocRef = doc(db, "units", selectedUnit);
    const unitSnapshot = await getDoc(unitDocRef);
    
    if (!unitSnapshot.exists()) {
      throw new Error("Unit not found");
    }
    
    // Create a base UnitData object with required id and default empty name
    const unitData: UnitData = {
      id: unitSnapshot.id,
      name: unitSnapshot.data().name || 'Unknown Unit',
      ...unitSnapshot.data() as DocumentData
    };
    
    // Fetch measurements for the report period
    const measurements = await fetchMeasurementsForReport(selectedUnit, reportType);
    
    // Generate report content based on unit data and measurements
    const reportContent = generateReportContent(unitData, reportType, measurements);

    // Save report to database
    const reportsCollection = collection(db, "reports");
    await addDoc(reportsCollection, {
      unit_id: selectedUnit,
      report_type: reportType,
      content: reportContent,
      measurements: measurements,
      generated_by: user.uid,
      created_at: new Date().toISOString()
    });

    // Notify parent component to refetch reports
    onReportGenerated();

    toast({
      title: "Success",
      description: `Generated ${reportType} report for ${unitData.name || 'selected unit'}`,
    });
  } catch (error: any) {
    console.error("Error generating report:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to generate report",
    });
  } finally {
    setIsGenerating(false);
  }
}
