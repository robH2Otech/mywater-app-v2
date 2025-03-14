
import { ReportGenerationForm } from "@/components/analytics/ReportGenerationForm";
import { ReportsList } from "@/components/analytics/ReportsList";
import { useReports } from "@/hooks/useReports";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";

export function Analytics() {
  const [selectedUnit, setSelectedUnit] = useState("");
  const { data: reports = [], isLoading, error, refetch: refetchReports } = useReports(selectedUnit);

  const handleReportGenerated = () => {
    refetchReports();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Analytics & Reports"
        description="Generate and view performance reports for your water treatment units"
      />
      
      <ReportGenerationForm 
        selectedUnit={selectedUnit}
        onUnitChange={setSelectedUnit}
        onReportGenerated={handleReportGenerated} 
      />
      
      <ReportsList 
        reports={reports} 
        isLoading={isLoading} 
        error={error} 
        refetchReports={refetchReports}
      />
    </div>
  );
}
