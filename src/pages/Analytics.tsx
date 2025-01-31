import { useState } from "react";
import { UnitSelector } from "@/components/analytics/UnitSelector";
import { ReportTypeSelector } from "@/components/analytics/ReportTypeSelector";
import { Button } from "@/components/ui/button";

export function Analytics() {
  const [selectedUnit, setSelectedUnit] = useState("");
  const [reportType, setReportType] = useState("");

  const handleGenerateReport = () => {
    console.log("Generating report for:", { selectedUnit, reportType });
    // Implement report generation logic here
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
        disabled={!selectedUnit || !reportType}
      >
        Generate Report
      </Button>
    </div>
  );
}
