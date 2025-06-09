
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
        uid: firebaseUser?.uid,
        company
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
        
        console.log(`📋 SimpleUnits: Fetched ${units.length} total units from Firebase`);
        
        // SUPERADMIN GETS ALL UNITS - NO FILTERING AT ALL
        if (userRole === 'superadmin') {
          console.log(`✅ SimpleUnits: SUPERADMIN - Returning ALL ${units.length} units (NO FILTERING)`);
          return units;
        }
        
        // For non-superadmin users: apply company filtering  
        if (company) {
          const originalLength = units.length;
          units = units.filter(unit => !unit.company || unit.company === company);
          console.log(`📋 SimpleUnits: Non-superadmin filtered from ${originalLength} to ${units.length} units for company: ${company}`);
        } else {
          console.log("⚠️ SimpleUnits: No company set for non-superadmin user");
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
