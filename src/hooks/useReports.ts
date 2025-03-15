
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, getDocs, orderBy, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { ReportData } from "@/types/analytics";
import { toast } from "@/components/ui/use-toast";

export function useReports(unitId: string) {
  const queryClient = useQueryClient();
  
  const reportsQuery = useQuery({
    queryKey: ["reports", unitId],
    queryFn: async () => {
      if (!unitId) return [];
      
      console.log("Fetching reports for unit:", unitId);
      const reportsCollection = collection(db, "reports");
      const q = query(
        reportsCollection, 
        where("unit_id", "==", unitId),
        orderBy("created_at", "desc")
      );
      
      const reportsSnapshot = await getDocs(q);
      const reportsList = reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ReportData[];
      
      console.log("Reports data:", reportsList);
      return reportsList;
    },
    enabled: !!unitId,
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      console.log("Deleting report:", reportId);
      const reportRef = doc(db, "reports", reportId);
      await deleteDoc(reportRef);
      return reportId;
    },
    onSuccess: (reportId) => {
      // Invalidate and refetch reports after deletion
      queryClient.invalidateQueries({ queryKey: ["reports", unitId] });
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete report. Please try again.",
      });
    }
  });

  return {
    ...reportsQuery,
    deleteReport: deleteReportMutation.mutate,
    isDeletingReport: deleteReportMutation.isPending
  };
}
