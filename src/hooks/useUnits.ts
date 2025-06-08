
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
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
        let queryRef;
        
        // Enhanced logging for superadmin detection
        const isSuperadmin = userRole === 'superadmin' || 
          firebaseUser.email === 'rob.istria@gmail.com' ||
          firebaseUser.email === 'robert.slavec@gmail.com' ||
          firebaseUser.email === 'aljaz.slavec@gmail.com';
        
        console.log("📋 useUnits: Is superadmin?", isSuperadmin);
        
        if (isSuperadmin) {
          // Superadmins can see all data
          queryRef = query(unitsRef, orderBy("name", "asc"));
          console.log("📋 useUnits: Fetching ALL units for superadmin");
        } else if (userRole === 'technician') {
          // Technicians can see all data but query with order
          queryRef = query(unitsRef, orderBy("name", "asc"));
          console.log("📋 useUnits: Fetching all units for technician");
        } else {
          // Other users filtered by company
          const userCompany = company || 'X-WATER';
          queryRef = query(unitsRef, where('company', '==', userCompany), orderBy("name", "asc"));
          console.log("📋 useUnits: Fetching units for company:", userCompany);
        }
        
        console.log("📋 useUnits: Executing Firestore query...");
        const snapshot = await getDocs(queryRef);
        
        const units = snapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            ...data
          } as UnitData;
        });
        
        console.log(`✅ useUnits: Successfully fetched ${units.length} units`);
        console.log("📋 useUnits: Sample unit data:", units[0] || "No units found");
        
        return units;
      } catch (error: any) {
        console.error("❌ useUnits: Firestore query failed:", error);
        console.error("❌ useUnits: Error details:", {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        
        // Enhanced error reporting
        if (error.code === 'permission-denied') {
          console.error("❌ useUnits: Permission denied - check Firestore rules and user authentication");
        }
        
        throw error;
      }
    },
    enabled: !!firebaseUser && !authLoading,
    retry: 1,
    staleTime: 30000,
  });
}
