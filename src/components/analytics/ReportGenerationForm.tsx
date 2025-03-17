
import { useState, useRef } from "react";
import { UnitSelector } from "@/components/analytics/UnitSelector";
import { ReportTypeSelector } from "@/components/analytics/ReportTypeSelector";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
  const [scrollPosition, setScrollPosition] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const maxScrollTop = scrollHeight - clientHeight;
      const currentPosition = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;
      setScrollPosition(currentPosition * 100);
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (contentRef.current) {
      const { scrollHeight, clientHeight } = contentRef.current;
      const maxScrollTop = scrollHeight - clientHeight;
      contentRef.current.scrollTop = (maxScrollTop * value[0]) / 100;
    }
  };

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
  };

  return (
    <div className="relative max-h-[90vh] space-y-6 border border-spotify-accent rounded-md p-6 bg-spotify-darker">
      <div 
        ref={contentRef} 
        className="form-dialog-content py-2 overflow-y-auto"
        onScroll={handleScroll}
      >
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
          className="bg-spotify-green hover:bg-spotify-green/90 mt-6"
          disabled={!selectedUnit || !reportType || isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate Report"}
        </Button>
      </div>
      
      {/* Form Navigation Slider */}
      <div className="form-slider-container absolute bottom-0 left-0 right-0">
        <Slider
          value={[scrollPosition]} 
          onValueChange={handleSliderChange}
          max={100}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );
}
