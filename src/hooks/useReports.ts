
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
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
      const reportsList = reportsSnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore timestamp to ISO string if present
        const created_at = data.created_at instanceof Timestamp 
          ? data.created_at.toDate().toISOString() 
          : data.created_at;
          
        return {
          id: doc.id,
          ...data,
          created_at
        };
      }) as ReportData[];
      
      console.log("Reports data:", reportsList);
      return reportsList;
    },
    enabled: !!unitId,
    refetchOnWindowFocus: false, 
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}
