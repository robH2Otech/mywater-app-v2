
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db, auth } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";

export function useAllUnits() {
  return useQuery({
    queryKey: ["all-units"],
    queryFn: async () => {
      console.log("🔍 Fetching ALL units from Firebase Firestore");
      
      // Check authentication first
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated - cannot fetch units");
      }
      
      console.log("👤 Authenticated user:", user.email);
      
      try {
        // Get fresh token
        const token = await user.getIdToken(true);
        console.log("🎟️ Fresh token obtained");
        
        const unitsCollection = collection(db, "units");
        const unitsQuery = query(unitsCollection, orderBy("name"));
        
        console.log("📡 Executing Firebase query for units...");
        const unitsSnapshot = await getDocs(unitsQuery);
        
        const units = unitsSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("📄 Unit document:", { id: doc.id, data });
          return {
            id: doc.id,
            name: data.name,
            status: data.status,
            location: data.location,
            company: data.company,
            total_volume: data.total_volume,
            last_maintenance: data.last_maintenance,
            unit_type: data.unit_type
          };
        }) as UnitData[];
        
        console.log(`✅ Successfully fetched ${units.length} units from Firebase`);
        return units;
      } catch (error) {
        console.error("❌ Error fetching units from Firebase:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          authDomain: auth.app.options.authDomain,
          projectId: db.app.options.projectId,
          userEmail: user.email
        });
        
        // Provide more helpful error messages
        if (error.code === 'permission-denied') {
          throw new Error(`Permission denied: Check Firestore rules for user ${user.email}`);
        }
        
        throw new Error(`Firebase units fetch failed: ${error.message}`);
      }
    },
    retry: (failureCount, error) => {
      console.log(`🔄 Retry attempt ${failureCount} for units query`);
      if (error?.message?.includes('Permission denied')) {
        console.log('❌ Permission error - not retrying');
        return false;
      }
      return failureCount < 2;
    }
  });
}

export function useAllAlerts() {
  return useQuery({
    queryKey: ["all-alerts"],
    queryFn: async () => {
      console.log("🔍 Fetching ALL alerts from Firebase Firestore");
      
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated - cannot fetch alerts");
      }
      
      try {
        await user.getIdToken(true); // Refresh token
        
        const alertsCollection = collection(db, "alerts");
        console.log("📡 Executing Firebase query for alerts...");
        const alertsSnapshot = await getDocs(alertsCollection);
        
        const alerts = alertsSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("📄 Alert document:", { id: doc.id, data });
          return {
            id: doc.id,
            ...data
          };
        });
        
        console.log(`✅ Successfully fetched ${alerts.length} alerts from Firebase`);
        return alerts;
      } catch (error) {
        console.error("❌ Error fetching alerts from Firebase:", error);
        
        if (error.code === 'permission-denied') {
          throw new Error(`Permission denied: Check Firestore rules for alerts collection`);
        }
        
        throw new Error(`Firebase alerts fetch failed: ${error.message}`);
      }
    },
    retry: (failureCount, error) => {
      if (error?.message?.includes('Permission denied')) {
        return false;
      }
      return failureCount < 2;
    }
  });
}

export function useAllFilters() {
  return useQuery({
    queryKey: ["all-filters"],
    queryFn: async () => {
      console.log("🔍 Fetching ALL filters from Firebase Firestore");
      
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated - cannot fetch filters");
      }
      
      try {
        await user.getIdToken(true); // Refresh token
        
        const filtersCollection = collection(db, "filters");
        console.log("📡 Executing Firebase query for filters...");
        const filtersSnapshot = await getDocs(filtersCollection);
        
        const filters = filtersSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("📄 Filter document:", { id: doc.id, data });
          return {
            id: doc.id,
            ...data
          };
        });
        
        console.log(`✅ Successfully fetched ${filters.length} filters from Firebase`);
        return filters;
      } catch (error) {
        console.error("❌ Error fetching filters from Firebase:", error);
        
        if (error.code === 'permission-denied') {
          throw new Error(`Permission denied: Check Firestore rules for filters collection`);
        }
        
        throw new Error(`Firebase filters fetch failed: ${error.message}`);
      }
    },
    retry: (failureCount, error) => {
      if (error?.message?.includes('Permission denied')) {
        return false;
      }
      return failureCount < 2;
    }
  });
}
