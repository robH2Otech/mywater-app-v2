
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { AlertData, FilterData, UnitData } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";

export function useSimpleDashboardData() {
  const { company, userRole, firebaseUser, isLoading: authLoading } = useAuth();

  // Fetch units using direct Firebase calls
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
        let queryRef;
        
        // Enhanced superadmin detection
        const isSuperadmin = userRole === 'superadmin' || 
          firebaseUser.email === 'rob.istria@gmail.com' ||
          firebaseUser.email === 'robert.slavec@gmail.com' ||
          firebaseUser.email === 'aljaz.slavec@gmail.com';
        
        if (isSuperadmin) {
          queryRef = query(unitsRef, orderBy("name", "asc"));
          console.log("📊 Dashboard: Fetching ALL units for superadmin");
        } else if (userRole === 'technician') {
          queryRef = query(unitsRef, orderBy("name", "asc"));
          console.log("📊 Dashboard: Fetching all units for technician");
        } else {
          const userCompany = company || 'X-WATER';
          queryRef = query(unitsRef, where('company', '==', userCompany), orderBy("name", "asc"));
          console.log("📊 Dashboard: Fetching units for company:", userCompany);
        }
        
        const snapshot = await getDocs(queryRef);
        const results = snapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            ...data
          } as UnitData;
        });
        
        console.log(`✅ Dashboard: Successfully fetched ${results.length} units`);
        return results;
      } catch (error: any) {
        console.error("❌ Dashboard: Units fetch failed:", error);
        if (error.code === 'permission-denied') {
          console.error("❌ Dashboard: Permission denied for units collection");
        }
        throw error;
      }
    },
    enabled: !!firebaseUser && !authLoading,
    retry: 1,
    staleTime: 30000,
  });

  // Fetch alerts using direct Firebase calls
  const { data: activeAlerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["dashboard-alerts", company, userRole, firebaseUser?.uid],
    queryFn: async () => {
      console.log("🚨 Dashboard: Starting alerts fetch...");
      
      if (!firebaseUser) {
        throw new Error("No authenticated user found");
      }
      
      try {
        const alertsRef = collection(db, "alerts");
        let queryRef;
        
        const isSuperadmin = userRole === 'superadmin' || 
          firebaseUser.email === 'rob.istria@gmail.com' ||
          firebaseUser.email === 'robert.slavec@gmail.com' ||
          firebaseUser.email === 'aljaz.slavec@gmail.com';
        
        if (isSuperadmin || userRole === 'technician') {
          queryRef = alertsRef;
          console.log("🚨 Dashboard: Fetching all alerts for", userRole);
        } else {
          const userCompany = company || 'X-WATER';
          queryRef = query(alertsRef, where('company', '==', userCompany));
          console.log("🚨 Dashboard: Fetching alerts for company:", userCompany);
        }
        
        const snapshot = await getDocs(queryRef);
        const allAlerts = snapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            ...data
          } as AlertData;
        });
        
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

  // Fetch filters using direct Firebase calls
  const { data: filtersNeedingChange = [], isLoading: filtersLoading } = useQuery({
    queryKey: ["dashboard-filters", company, userRole, firebaseUser?.uid],
    queryFn: async () => {
      console.log("🔧 Dashboard: Starting filters fetch...");
      
      if (!firebaseUser) {
        throw new Error("No authenticated user found");
      }
      
      try {
        const filtersRef = collection(db, "filters");
        let queryRef;
        
        const isSuperadmin = userRole === 'superadmin' || 
          firebaseUser.email === 'rob.istria@gmail.com' ||
          firebaseUser.email === 'robert.slavec@gmail.com' ||
          firebaseUser.email === 'aljaz.slavec@gmail.com';
        
        if (isSuperadmin || userRole === 'technician') {
          queryRef = filtersRef;
          console.log("🔧 Dashboard: Fetching all filters for", userRole);
        } else {
          const userCompany = company || 'X-WATER';
          queryRef = query(filtersRef, where('company', '==', userCompany));
          console.log("🔧 Dashboard: Fetching filters for company:", userCompany);
        }
        
        const snapshot = await getDocs(queryRef);
        const allFilters = snapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            ...data
          } as (FilterData & { status: string });
        });
        
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
