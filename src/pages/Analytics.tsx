
import { ReportGenerationForm } from "@/components/analytics/ReportGenerationForm";
import { ReportsList } from "@/components/analytics/ReportsList";
import { useReports } from "@/hooks/useReports";
import { useState } from "react";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";

export function Analytics() {
  const [selectedUnit, setSelectedUnit] = useState("");
  const { 
    data: reports = [], 
    refetch: refetchReports,
    isLoading: isLoadingReports 
  } = useReports(selectedUnit);

  const handleReportGenerated = () => {
    console.log("Report generated, refreshing reports list");
    refetchReports();
  };

  return (
    <div className="container mx-auto space-y-6">
      <PageHeader title="Analytics" description="Generate and view reports for your water units" />
      
      <div className="bg-spotify-darker rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Generate New Report</h2>
        <ReportGenerationForm 
          selectedUnit={selectedUnit}
          onUnitChange={setSelectedUnit}
          onReportGenerated={handleReportGenerated} 
        />
      </div>
      
      {!selectedUnit ? (
        <div className="bg-spotify-darker rounded-lg p-6 shadow-lg">
          <p className="text-center text-gray-400">
            Please select a unit to view available reports
          </p>
        </div>
      ) : isLoadingReports ? (
        <div className="bg-spotify-darker rounded-lg p-6 shadow-lg">
          <LoadingSkeleton />
        </div>
      ) : (
        <div className="bg-spotify-darker rounded-lg p-6 shadow-lg">
          {reports.length === 0 ? (
            <p className="text-center text-gray-400">
              No reports available for the selected unit
            </p>
          ) : (
            <ReportsList reports={reports} />
          )}
        </div>
      )}
    </div>
  );
}
