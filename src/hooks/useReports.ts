
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
      
      try {
        const reportsSnapshot = await getDocs(q);
        
        if (reportsSnapshot.empty) {
          console.log("No reports found for this unit");
          return [];
        }
        
        const reportsList = reportsSnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Ensure measurements data is properly structured
          const measurements = data.measurements || [];
          
          return {
            id: doc.id,
            ...data,
            measurements
          } as ReportData;
        });
        
        console.log("Reports data:", reportsList);
        return reportsList;
      } catch (error) {
        console.error("Error fetching reports:", error);
        throw error;
      }
    },
    enabled: !!unitId,
  });
}
