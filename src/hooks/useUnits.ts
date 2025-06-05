
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
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
      // Fetch all units and filter client-side for better compatibility
      const unitsQuery = query(unitsCollection, orderBy("name"));
      
      const unitsSnapshot = await getDocs(unitsQuery);
      
      const allUnits = unitsSnapshot.docs.map(doc => {
        const data = doc.data() as Record<string, any>;
        return {
          id: doc.id,
          name: data.name,
          status: data.status,
          location: data.location,
          company: data.company || company // Use user's company if unit has no company field
        } as UnitData;
      });
      
      let filteredUnits;
      if (isSuperAdmin) {
        // Superadmin sees all units
        filteredUnits = allUnits;
      } else {
        // Filter by company for other roles - include units with no company field
        filteredUnits = allUnits.filter(unit => 
          !unit.company || unit.company === company
        );
      }
      
      console.log(`📋 useUnits: Fetched ${filteredUnits.length} units for company: ${company}, role: ${userRole}`);
      return filteredUnits;
    },
    enabled: !!userRole && !!company, // Only fetch when user role and company are available
  });
}
