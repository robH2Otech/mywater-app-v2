
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
      const reportsCollection = collection(db, "reports");
      const q = query(
        reportsCollection, 
        where("unit_id", "==", unitId),
        orderBy("created_at", "desc")
      );
      
      const reportsSnapshot = await getDocs(q);
      const reportsList = reportsSnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Convert units to m³ in report content if needed
        if (data.content && typeof data.content === 'string') {
          data.content = data.content.replace(/units/g, 'm³');
        }
        
        return {
          id: doc.id,
          ...data
        } as ReportData;
      });
      
      console.log("Reports data:", reportsList);
      return reportsList;
    },
    enabled: !!unitId,
  });
}
