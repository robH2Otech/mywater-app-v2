
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";

export function useUnits() {
  return useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const unitsCollection = collection(db, "units");
      const unitsQuery = query(unitsCollection, orderBy("name"));
      const unitsSnapshot = await getDocs(unitsQuery);
      
      return unitsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        // Include other basic fields that might be needed
        status: doc.data().status,
        location: doc.data().location
      })) as UnitData[];
    },
  });
}
