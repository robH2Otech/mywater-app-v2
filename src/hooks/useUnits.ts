
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";

export function useUnits() {
  const { company, userRole, firebaseUser, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["units", company, userRole, firebaseUser?.uid],
    queryFn: async () => {
      console.log("📋 useUnits: Starting data fetch...");
      console.log("📋 useUnits: Auth state:", { 
        userRole, 
        company, 
        userEmail: firebaseUser?.email,
        uid: firebaseUser?.uid 
      });
      
      if (!firebaseUser) {
        throw new Error("No authenticated user found");
      }
      
      try {
        const unitsRef = collection(db, "units");
        
        // Simplified logic: superadmins get ALL data, others get filtered data
        const isSuperadmin = userRole === 'superadmin';
        
        console.log("📋 useUnits: Is superadmin?", isSuperadmin);
        
        // Always use simple orderBy query - no company filtering in Firestore
        const queryRef = query(unitsRef, orderBy("name", "asc"));
        
        if (isSuperadmin) {
          console.log("📋 useUnits: Fetching ALL units for superadmin");
        } else {
          console.log("📋 useUnits: Fetching units (will filter client-side if needed)");
        }
        
        console.log("📋 useUnits: Executing Firestore query...");
        const snapshot = await getDocs(queryRef);
        
        let units = snapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            ...data
          } as UnitData;
        });
        
        // Client-side filtering for non-superadmins (if needed)
        if (!isSuperadmin && company) {
          const originalLength = units.length;
          units = units.filter(unit => !unit.company || unit.company === company);
          console.log(`📋 useUnits: Filtered from ${originalLength} to ${units.length} units for company: ${company}`);
        }
        
        console.log(`✅ useUnits: Successfully fetched ${units.length} units`);
        console.log("📋 useUnits: Sample unit data:", units[0] || "No units found");
        
        return units;
      } catch (error: any) {
        console.error("❌ useUnits: Firestore query failed:", error);
        throw error;
      }
    },
    enabled: !!firebaseUser && !authLoading,
    retry: 1,
    staleTime: 30000,
  });
}
