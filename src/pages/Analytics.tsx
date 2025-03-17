
import { ReportGenerationForm } from "@/components/analytics/ReportGenerationForm";
import { ReportsList } from "@/components/analytics/ReportsList";
import { useReports } from "@/hooks/useReports";
import { useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { toast } from "@/components/ui/use-toast";

export function Analytics() {
  const [selectedUnit, setSelectedUnit] = useState("");
  const { data: reports = [], refetch: refetchReports } = useReports(selectedUnit);

  const handleReportGenerated = () => {
    refetchReports();
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      // Delete the report document from Firestore
      const reportDocRef = doc(db, "reports", reportId);
      await deleteDoc(reportDocRef);
      
      // Refresh the reports list
      refetchReports();
      
      toast({
        title: "Report deleted",
        description: "The report has been removed successfully.",
      });
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete report",
      });
      throw error; // Rethrow to be handled by the component
    }
  };

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
        onDeleteReport={handleDeleteReport}
      />
    </div>
  );
}
