
import { useState } from "react";
import { UnitSelector } from "@/components/analytics/UnitSelector";
import { ReportTypeSelector } from "@/components/analytics/ReportTypeSelector";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { doc, getDoc, addDoc, collection, DocumentData } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";
import { generateReportContent } from "@/utils/reportGenerator";

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
      
      // Cast the data to our UnitData interface to ensure type safety
      const unitData: UnitData = {
        id: unitSnapshot.id,
        ...unitSnapshot.data() as DocumentData
      };

      // Generate report content based on unit data
      const reportContent = generateReportContent(unitData, reportType);

      // Save report to database
      const reportsCollection = collection(db, "reports");
      await addDoc(reportsCollection, {
        unit_id: selectedUnit,
        report_type: reportType,
        content: reportContent,
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
        className="bg-spotify-green hover:bg-spotify-green/90"
        disabled={!selectedUnit || !reportType || isGenerating}
      >
        {isGenerating ? "Generating..." : "Generate Report"}
      </Button>
    </div>
  );
}
