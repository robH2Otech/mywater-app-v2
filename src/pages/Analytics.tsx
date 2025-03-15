
import { ReportGenerationForm } from "@/components/analytics/ReportGenerationForm";
import { ReportsList } from "@/components/analytics/ReportsList";
import { useReports } from "@/hooks/useReports";
import { useState } from "react";

export function Analytics() {
  const [selectedUnit, setSelectedUnit] = useState("");
  const { data: reports = [], refetch: refetchReports } = useReports(selectedUnit);

  const handleReportGenerated = () => {
    refetchReports();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      
      <ReportGenerationForm 
        selectedUnit={selectedUnit}
        onUnitChange={setSelectedUnit}
        onReportGenerated={handleReportGenerated} 
      />
      
      <ReportsList reports={reports} />
    </div>
  );
}
