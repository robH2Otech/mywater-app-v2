
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { ReportData } from "@/types/analytics";

export function useReports(unitId: string) {
  return useQuery({
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
    refetchOnWindowFocus: true, // Refetch when window gets focus
    refetchOnMount: true, // Refetch when component mounts
  });
}
