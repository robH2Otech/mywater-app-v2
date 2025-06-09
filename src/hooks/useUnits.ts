import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";

export function useUnits() {
  const { userRole, company } = useAuth();
  
  return useQuery({
    queryKey: ["units", userRole, company],
    queryFn: async () => {
      console.log("Fetching units for role:", userRole, "company:", company);
      
      try {
        const unitsCollection = collection(db, "units");
        const unitsQuery = query(unitsCollection, orderBy("name"));
        const unitsSnapshot = await getDocs(unitsQuery);
        
        const units = unitsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          status: doc.data().status,
          location: doc.data().location,
          company: doc.data().company,
          total_volume: doc.data().total_volume,
          last_maintenance: doc.data().last_maintenance,
          unit_type: doc.data().unit_type
        })) as UnitData[];
        
        console.log(`Fetched ${units.length} units. User role: ${userRole}`);
        
        // Superadmin gets ALL units regardless of company
        if (userRole === 'superadmin') {
          console.log("Superadmin access: returning all units");
          return units;
        }
        
        // Other roles get filtered by company
        if (company && company !== 'private') {
          const filteredUnits = units.filter(unit => unit.company === company);
          console.log(`Filtered to ${filteredUnits.length} units for company: ${company}`);
          return filteredUnits;
        }
        
        return units;
      } catch (error) {
        console.error("Error fetching units:", error);
        throw error;
      }
    },
    enabled: !!userRole, // Only fetch when user role is available
  });
}
