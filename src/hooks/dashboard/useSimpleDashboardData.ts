
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { AlertData, FilterData, UnitData } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";

export function useSimpleDashboardData() {
  const { company, userRole, firebaseUser, isLoading: authLoading } = useAuth();

  // Fetch units
  const { data: units = [], isLoading: unitsLoading, error: unitsError } = useQuery({
    queryKey: ["dashboard-units", company, userRole, firebaseUser?.uid],
    queryFn: async () => {
      console.log("📊 Dashboard: Starting units fetch...");
      console.log("📊 Dashboard: Auth state:", { 
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
        const isSuperadmin = userRole === 'superadmin';
        
        // Simple query without any Firestore filtering
        const queryRef = query(unitsRef, orderBy("name", "asc"));
        
        console.log("📊 Dashboard: Fetching units for", isSuperadmin ? "superadmin (ALL)" : `${userRole} (${company})`);
        
        const snapshot = await getDocs(queryRef);
        let results = snapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            ...data
          } as UnitData;
        });
        
        // Client-side filtering for non-superadmins
        if (!isSuperadmin && company) {
          const originalLength = results.length;
          results = results.filter(unit => !unit.company || unit.company === company);
          console.log(`📊 Dashboard: Filtered from ${originalLength} to ${results.length} units`);
        }
        
        console.log(`✅ Dashboard: Successfully fetched ${results.length} units`);
        return results;
      } catch (error: any) {
        console.error("❌ Dashboard: Units fetch failed:", error);
        throw error;
      }
    },
    enabled: !!firebaseUser && !authLoading,
    retry: 1,
    staleTime: 30000,
  });

  // Fetch alerts
  const { data: activeAlerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["dashboard-alerts", company, userRole, firebaseUser?.uid],
    queryFn: async () => {
      console.log("🚨 Dashboard: Starting alerts fetch...");
      
      if (!firebaseUser) {
        throw new Error("No authenticated user found");
      }
      
      try {
        const alertsRef = collection(db, "alerts");
        const isSuperadmin = userRole === 'superadmin';
        
        // Simple query without Firestore filtering
        const queryRef = alertsRef;
        
        console.log("🚨 Dashboard: Fetching alerts for", isSuperadmin ? "superadmin (ALL)" : `${userRole} (${company})`);
        
        const snapshot = await getDocs(queryRef);
        let allAlerts = snapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            ...data
          } as AlertData;
        });
        
        // Client-side filtering for non-superadmins
        if (!isSuperadmin && company) {
          allAlerts = allAlerts.filter(alert => !alert.company || alert.company === company);
        }
        
        const activeFilteredAlerts = allAlerts.filter(alert => 
          alert.status === "warning" || alert.status === "urgent"
        );
        
        console.log(`✅ Dashboard: Successfully fetched ${activeFilteredAlerts.length} active alerts`);
        return activeFilteredAlerts;
      } catch (error: any) {
        console.error("❌ Dashboard: Alerts fetch failed:", error);
        throw error;
      }
    },
    enabled: !!firebaseUser && !authLoading,
    retry: 1,
    staleTime: 30000,
  });

  // Fetch filters
  const { data: filtersNeedingChange = [], isLoading: filtersLoading } = useQuery({
    queryKey: ["dashboard-filters", company, userRole, firebaseUser?.uid],
    queryFn: async () => {
      console.log("🔧 Dashboard: Starting filters fetch...");
      
      if (!firebaseUser) {
        throw new Error("No authenticated user found");
      }
      
      try {
        const filtersRef = collection(db, "filters");
        const isSuperadmin = userRole === 'superadmin';
        
        // Simple query without Firestore filtering
        const queryRef = filtersRef;
        
        console.log("🔧 Dashboard: Fetching filters for", isSuperadmin ? "superadmin (ALL)" : `${userRole} (${company})`);
        
        const snapshot = await getDocs(queryRef);
        let allFilters = snapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            ...data
          } as (FilterData & { status: string });
        });
        
        // Client-side filtering for non-superadmins
        if (!isSuperadmin && company) {
          allFilters = allFilters.filter(filter => !filter.company || filter.company === company);
        }
        
        const filtersNeedingAttention = allFilters.filter(filter => 
          filter.status === "warning" || filter.status === "critical"
        );
        
        console.log(`✅ Dashboard: Successfully fetched ${filtersNeedingAttention.length} filters needing change`);
        return filtersNeedingAttention;
      } catch (error: any) {
        console.error("❌ Dashboard: Filters fetch failed:", error);
        throw error;
      }
    },
    enabled: !!firebaseUser && !authLoading,
    retry: 1,
    staleTime: 30000,
  });

  const totalVolume = units.reduce((sum, unit) => {
    const volume = typeof unit.total_volume === 'string' ? parseFloat(unit.total_volume) || 0 : unit.total_volume || 0;
    return sum + volume;
  }, 0);
  const formattedVolume = `${totalVolume}m³`;
  
  const isLoading = unitsLoading || alertsLoading || filtersLoading || authLoading;
  const hasError = unitsError;

  return {
    units,
    activeAlerts,
    filtersNeedingChange,
    formattedVolume,
    isLoading,
    hasError,
    company: company || 'X-WATER',
    userRole: userRole || 'technician',
  };
}
