
import { useState } from "react";
import { UnitSelector } from "@/components/analytics/UnitSelector";
import { ReportTypeSelector } from "@/components/analytics/ReportTypeSelector";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";
import { 
  generateReportContent, 
  fetchMeasurementsForReport,
  calculateMetricsFromMeasurements
} from "@/utils/reportGenerator";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReportGenerationFormProps {
  selectedUnit: string;
  onUnitChange: (unitId: string) => void;
  onReportGenerated: () => void;
}

export function ReportGenerationForm({ 
  selectedUnit, 
  onUnitChange, 
  onReportGenerated 
}: ReportGenerationFormProps) {
  const [reportType, setReportType] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    if (!selectedUnit || !reportType) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a unit and report type",
      });
      return;
    }

    setIsGenerating(true);
    setError(null);
    
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
        ...unitSnapshot.data()
      };
      
      console.log("Fetching measurements for report generation...");
      // Fetch measurements for the report period
      const measurements = await fetchMeasurementsForReport(selectedUnit, reportType);
      
      if (!measurements || measurements.length === 0) {
        console.log("No measurements found for the selected period");
        // Continue but with empty measurements
      }
      
      // Generate report content based on unit data and measurements
      const reportContent = generateReportContent(unitData, reportType, measurements);

      // Calculate metrics
      const metrics = calculateMetricsFromMeasurements(measurements);

      console.log("Saving report to Firestore...");
      // Save report to database with server timestamp
      const reportsCollection = collection(db, "reports");
      const reportDoc = await addDoc(reportsCollection, {
        unit_id: selectedUnit,
        unit_name: unitData.name, // Add unit name to report document
        report_type: reportType,
        content: reportContent,
        measurements: measurements,
        metrics: metrics,
        generated_by: user.uid,
        created_at: serverTimestamp()
      });

      console.log("Report generated successfully with ID:", reportDoc.id);
      // Notify parent component to refetch reports
      onReportGenerated();

      toast({
        title: "Success",
        description: `Generated ${reportType} report for ${unitData.name || 'selected unit'}`,
      });
    } catch (error: any) {
      console.error("Error generating report:", error);
      let errorMessage = error.message || "Failed to generate report";
      
      // Handle specific error cases
      if (errorMessage.includes("requires an index")) {
        errorMessage = "The report list requires a Firebase index. Contact your administrator to set it up.";
      } else if (errorMessage.includes("fetch measurements")) {
        errorMessage = "Failed to retrieve measurement data. Please try again later.";
      }
      
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="bg-spotify-darker">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Generate New Report</h2>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <UnitSelector 
              value={selectedUnit} 
              onChange={onUnitChange} 
            />
            
            <ReportTypeSelector 
              value={reportType} 
              onChange={setReportType} 
            />
          </div>

          <Button 
            onClick={handleGenerateReport}
            className="bg-spotify-green hover:bg-spotify-green/90"
            disabled={!selectedUnit || !reportType || isGenerating}
          >
            {isGenerating ? "Generating..." : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
