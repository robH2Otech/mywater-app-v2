
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
      let unitData: UnitData = {
        id: unitSnapshot.id,
        name: unitSnapshot.data().name || 'Unknown Unit',
        ...unitSnapshot.data() as DocumentData
      };
      
      // Fetch measurements for the report period
      const measurements = await fetchMeasurementsForReport(selectedUnit, reportType);
      
      // Update unit data with latest volume and UVC hours from measurements
      if (measurements.length > 0) {
        // Sort measurements to get the most recent one
        const sortedMeasurements = [...measurements].sort((a, b) => {
          const dateA = typeof a.timestamp === 'string' ? new Date(a.timestamp) : a.timestamp;
          const dateB = typeof b.timestamp === 'string' ? new Date(b.timestamp) : b.timestamp;
          return dateB.getTime() - dateA.getTime();
        });
        
        const latestMeasurement = sortedMeasurements[0];
        
        // Update unitData with the latest values from measurements
        if (latestMeasurement.volume !== undefined) {
          const latestVolume = typeof latestMeasurement.volume === 'number' 
            ? Number(latestMeasurement.volume.toFixed(2)) 
            : Number(parseFloat(String(latestMeasurement.volume) || '0').toFixed(2));
          
          unitData.total_volume = latestVolume;
          console.log(`Updated unit total_volume to latest: ${latestVolume}`);
        }
        
        if (latestMeasurement.uvc_hours !== undefined) {
          const latestUvcHours = typeof latestMeasurement.uvc_hours === 'number' 
            ? Number(latestMeasurement.uvc_hours.toFixed(1)) 
            : Number(parseFloat(String(latestMeasurement.uvc_hours) || '0').toFixed(1));
          
          unitData.uvc_hours = latestUvcHours;
          console.log(`Updated unit uvc_hours to latest: ${latestUvcHours}`);
        }
      } else {
        // If no measurements, attempt to fetch the latest volume separately
        try {
          const latestVolume = await fetchLatestVolume(selectedUnit);
          if (latestVolume > 0) {
            unitData.total_volume = Number(latestVolume.toFixed(2));
            console.log(`Fetched latest volume separately: ${latestVolume}`);
          }
        } catch (err) {
          console.warn("Could not fetch latest volume:", err);
        }
      }
      
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
        disabled={!selectedUnit || !reportType || isGenerating}
      >
        {isGenerating ? "Generating..." : "Generate Report"}
      </Button>
    </div>
  );
}
