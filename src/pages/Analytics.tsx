
import { useState } from "react";
import { UnitSelector } from "@/components/analytics/UnitSelector";
import { ReportTypeSelector } from "@/components/analytics/ReportTypeSelector";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function Analytics() {
  const [selectedUnit, setSelectedUnit] = useState("");
  const [reportType, setReportType] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // Fetch unit data
      const { data: unitData, error: unitError } = await supabase
        .from("units")
        .select("name")
        .eq("id", selectedUnit)
        .single();

      if (unitError) throw unitError;

      // Show success message
      toast({
        title: "Report Generated",
        description: `Generated ${reportType} report for ${unitData.name}`,
      });

      // Log for debugging
      console.log("Generated report for:", {
        unit: unitData.name,
        unitId: selectedUnit,
        reportType,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate report. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <UnitSelector 
          value={selectedUnit} 
          onChange={setSelectedUnit} 
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
