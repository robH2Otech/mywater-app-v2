
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";

export function useUnits() {
  const { company, userRole } = useAuth();
  const isSuperAdmin = userRole === 'superadmin';

  return useQuery({
    queryKey: ["units", company, userRole],
    queryFn: async () => {
      const unitsCollection = collection(db, "units");
      let unitsQuery;
      
      if (isSuperAdmin) {
        // Superadmin sees all units
        unitsQuery = query(unitsCollection, orderBy("name"));
      } else {
        // Filter by company for other roles
        unitsQuery = query(
          unitsCollection, 
          where("company", "==", company || ""),
          orderBy("name")
        );
      }
      
      const unitsSnapshot = await getDocs(unitsQuery);
      
      const units = unitsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          status: data.status,
          location: data.location,
          company: data.company
        } as UnitData;
      });
      
      console.log(`📋 useUnits: Fetched ${units.length} units for company: ${company}, role: ${userRole}`);
      return units;
    },
    enabled: !!userRole && !!company, // Only fetch when user role and company are available
  });
}
