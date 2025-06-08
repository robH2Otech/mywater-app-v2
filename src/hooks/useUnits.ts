import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";

export function useUnits() {
  const { company, userRole } = useAuth();

  return useQuery({
    queryKey: ["units", company, userRole],
    queryFn: async () => {
      console.log("📋 useUnits: Fetching units data directly from Firebase...");
      
      try {
        const unitsRef = collection(db, "units");
        let queryRef;
        
        if (userRole === 'technician' || userRole === 'superadmin') {
          // Technicians and superadmins can see all data
          queryRef = query(unitsRef, orderBy("name", "asc"));
          console.log("📋 useUnits: Fetching all units for", userRole);
        } else {
          // Other users filtered by company
          const userCompany = company || 'X-WATER';
          queryRef = query(unitsRef, where('company', '==', userCompany), orderBy("name", "asc"));
          console.log("📋 useUnits: Fetching units for company:", userCompany);
        }
        
        const snapshot = await getDocs(queryRef);
        const units = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UnitData[];
        
        console.log(`📋 useUnits: Fetched ${units.length} units for company: ${company}, role: ${userRole}`);
        return units;
      } catch (error) {
        console.error("📋 useUnits: Error fetching units:", error);
        throw error;
      }
    },
    enabled: !!userRole && !!company,
    retry: 1,
    staleTime: 30000,
  });
}
