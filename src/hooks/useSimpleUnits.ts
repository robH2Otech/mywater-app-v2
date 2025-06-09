
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";

export function useSimpleUnits() {
  const { firebaseUser, userRole, company } = useAuth();

  return useQuery({
    queryKey: ["simple-units", userRole, firebaseUser?.uid],
    queryFn: async () => {
      console.log("📋 SimpleUnits: Starting data fetch...");
      console.log("📋 SimpleUnits: Auth state:", { 
        userRole, 
        userEmail: firebaseUser?.email,
        uid: firebaseUser?.uid 
      });
      
      if (!firebaseUser) {
        console.log("❌ SimpleUnits: No authenticated user");
        return [];
      }
      
      try {
        const unitsRef = collection(db, "units");
        const queryRef = query(unitsRef, orderBy("name", "asc"));
        
        console.log("📋 SimpleUnits: Executing Firestore query...");
        const snapshot = await getDocs(queryRef);
        
        let units = snapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            ...data
          } as UnitData;
        });
        
        // For superadmin: return ALL units
        if (userRole === 'superadmin') {
          console.log(`✅ SimpleUnits: Superadmin fetched ${units.length} units (ALL)`);
          return units;
        }
        
        // For other users: filter by company
        if (company) {
          units = units.filter(unit => !unit.company || unit.company === company);
          console.log(`✅ SimpleUnits: Filtered to ${units.length} units for company: ${company}`);
        }
        
        return units;
      } catch (error: any) {
        console.error("❌ SimpleUnits: Firestore query failed:", error);
        throw error;
      }
    },
    enabled: !!firebaseUser,
    retry: 1,
    staleTime: 30000,
  });
}
