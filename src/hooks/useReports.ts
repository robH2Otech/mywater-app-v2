
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { ReportData } from "@/types/analytics";

export function useReports(unitId: string) {
  return useQuery({
    queryKey: ["reports", unitId],
    queryFn: async () => {
      if (!unitId) return [];
      
      console.log("Fetching reports for unit:", unitId);
      try {
        const reportsCollection = collection(db, "reports");
        // Using only one orderBy to avoid the need for a composite index
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
      } catch (error: any) {
        console.error("Error fetching reports:", error);
        // Create a more helpful error message when an index is needed
        if (error.message && error.message.includes("requires an index")) {
          const indexUrl = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
          throw new Error(`Firebase needs an index for this query. Please follow this link to create it: ${indexUrl ? indexUrl[0] : "https://console.firebase.google.com"}`);
        }
        throw error;
      }
    },
    enabled: !!unitId,
  });
}
