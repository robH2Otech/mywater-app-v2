
import { useState } from "react";
import { UnitSelector } from "@/components/analytics/UnitSelector";
import { ReportTypeSelector } from "@/components/analytics/ReportTypeSelector";
import { Button } from "@/components/ui/button";
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
import { fetchLatestVolume } from "@/hooks/measurements/useUnitVolume";
import { Measurement } from "@/utils/measurements/types";
import { useAuth } from "@/contexts/AuthContext";

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
  const { firebaseUser, hasPermission } = useAuth();

  const handleGenerateReport = async () => {
    if (!selectedUnit || !reportType) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a unit and report type",
      });
      return;
    }

    // Check authentication
    if (!firebaseUser) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You must be logged in to generate reports",
      });
      return;
    }

    // Check permissions
    if (!hasPermission("read")) {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "You don't have permission to generate reports",
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log("🔄 Starting report generation for unit:", selectedUnit);

      // Fetch real unit data from Firebase
      const unitDocRef = doc(db, "units", selectedUnit);
      const unitSnapshot = await getDoc(unitDocRef);
      
      if (!unitSnapshot.exists()) {
        throw new Error(`Unit ${selectedUnit} not found in Firebase`);
      }

      const unitData: UnitData = {
        id: unitSnapshot.id,
        name: unitSnapshot.data().name || `Unit ${selectedUnit}`,
        ...unitSnapshot.data() as DocumentData
      };
      
      console.log("✅ Fetched unit data from Firebase:", unitData);
      
      // Try to fetch real measurements for the report period
      let measurements: Measurement[] = [];
      try {
        measurements = await fetchMeasurementsForReport(selectedUnit, reportType);
        console.log("✅ Fetched", measurements.length, "measurements from Firebase");
      } catch (measurementError) {
        console.log("⚠️ Could not fetch measurements from Firebase:", measurementError);
        // If no measurements available, create empty array - don't use fake data
        measurements = [];
      }
      
      // Update unit data with latest measurement values if available
      if (measurements.length > 0) {
        const latestMeasurement = measurements[0];
        if (latestMeasurement.volume !== undefined) {
          unitData.total_volume = Number(latestMeasurement.volume.toFixed(2));
        }
        if (latestMeasurement.uvc_hours !== undefined) {
          unitData.uvc_hours = Number(latestMeasurement.uvc_hours.toFixed(1));
        }
      }
      
      // Generate report content based on real unit data and measurements
      const reportContent = generateReportContent(unitData, reportType, measurements);

      // Save report to Firebase
      try {
        const reportsCollection = collection(db, "reports");
        await addDoc(reportsCollection, {
          unit_id: selectedUnit,
          report_type: reportType,
          content: reportContent,
          measurements: measurements,
          generated_by: firebaseUser.uid,
          created_at: new Date().toISOString()
        });
        
        console.log("✅ Report saved successfully to Firebase");
        
        toast({
          title: "Success",
          description: `Generated ${reportType} report for ${unitData.name}`,
        });
      } catch (saveError) {
        console.error("❌ Could not save report to Firebase:", saveError);
        toast({
          title: "Report Generated",
          description: `Generated ${reportType} report but could not save to database`,
          variant: "destructive"
        });
      }

      // Notify parent component to refetch reports
      onReportGenerated();
      
    } catch (error: any) {
      console.error("❌ Error generating report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate report. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
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
        className="bg-mywater-blue hover:bg-mywater-blue/90"
        disabled={!selectedUnit || !reportType || isGenerating || !firebaseUser}
      >
        {isGenerating ? "Generating..." : "Generate Report"}
      </Button>
      
      {!firebaseUser && (
        <p className="text-sm text-yellow-400">
          Please log in to generate reports
        </p>
      )}
    </div>
  );
}
