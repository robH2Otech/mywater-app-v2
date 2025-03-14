
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";

export function useUnitDetails(id: string | undefined) {
  return useQuery({
    queryKey: ["unit", id],
    queryFn: async () => {
      if (!id) throw new Error("Unit ID is required");
      
      const unitDocRef = doc(db, "units", id);
      const unitSnapshot = await getDoc(unitDocRef);
      
      if (!unitSnapshot.exists()) {
        throw new Error("Unit not found");
      }
      
      const unitData = unitSnapshot.data();
      
      // Ensure total_volume is a number for consistent handling
      let totalVolume = unitData.total_volume;
      if (typeof totalVolume === 'string') {
        totalVolume = parseFloat(totalVolume);
      } else if (totalVolume === undefined || totalVolume === null) {
        totalVolume = 0;
      }
      
      return {
        id: unitSnapshot.id,
        ...unitData,
        // Always return total_volume as a number
        total_volume: totalVolume
      } as UnitData;
    },
    enabled: !!id,
  });
}
