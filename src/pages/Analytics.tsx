
import { ReportGenerationForm } from "@/components/analytics/ReportGenerationForm";
import { ReportsList } from "@/components/analytics/ReportsList";
import { useReports } from "@/hooks/useReports";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

export function Analytics() {
  const [selectedUnit, setSelectedUnit] = useState("");
  const { data: reports = [], refetch: refetchReports, isLoading, error } = useReports(selectedUnit);

  const handleReportGenerated = () => {
    console.log("Report generated, refetching reports...");
    refetchReports();
  };

  // Show error toast if report fetching fails
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading reports",
        description: "Failed to load reports. Please try again.",
      });
      console.error("Error fetching reports:", error);
    }
  }, [error]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      
      <ReportGenerationForm 
        selectedUnit={selectedUnit}
        onUnitChange={setSelectedUnit}
        onReportGenerated={handleReportGenerated} 
      />
      
      <ReportsList 
        reports={reports} 
        isLoading={isLoading} 
        onRefresh={refetchReports}
      />
    </div>
  );
}
