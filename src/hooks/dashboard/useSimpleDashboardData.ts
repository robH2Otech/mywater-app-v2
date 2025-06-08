import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { AlertData, FilterData, UnitData } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";

export function useSimpleDashboardData() {
  const { company, userRole } = useAuth();

  // Fetch units using direct Firebase calls
  const { data: units = [], isLoading: unitsLoading, error: unitsError } = useQuery({
    queryKey: ["dashboard-units", company, userRole],
    queryFn: async () => {
      console.log("📊 Dashboard: Fetching units data directly from Firebase...");
      
      try {
        const unitsRef = collection(db, "units");
        let queryRef;
        
        if (userRole === 'technician' || userRole === 'superadmin') {
          // Technicians and superadmins can see all data
          queryRef = query(unitsRef, orderBy("name", "asc"));
          console.log("📊 Dashboard: Fetching all units for", userRole);
        } else {
          // Other users filtered by company
          const userCompany = company || 'X-WATER';
          queryRef = query(unitsRef, where('company', '==', userCompany), orderBy("name", "asc"));
          console.log("📊 Dashboard: Fetching units for company:", userCompany);
        }
        
        const snapshot = await getDocs(queryRef);
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UnitData[];
        
        console.log(`📊 Dashboard: Successfully fetched ${results.length} units`);
        return results;
      } catch (error) {
        console.error("📊 Dashboard: Error fetching units:", error);
        throw error;
      }
    },
    enabled: !!userRole && !!company,
    retry: 1,
    staleTime: 30000,
  });

  // Fetch alerts using direct Firebase calls
  const { data: activeAlerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["dashboard-alerts", company, userRole],
    queryFn: async () => {
      console.log("🚨 Dashboard: Fetching alerts data directly from Firebase...");
      
      try {
        const alertsRef = collection(db, "alerts");
        let queryRef;
        
        if (userRole === 'technician' || userRole === 'superadmin') {
          // Technicians and superadmins can see all alerts
          queryRef = alertsRef;
          console.log("🚨 Dashboard: Fetching all alerts for", userRole);
        } else {
          // Other users filtered by company
          const userCompany = company || 'X-WATER';
          queryRef = query(alertsRef, where('company', '==', userCompany));
          console.log("🚨 Dashboard: Fetching alerts for company:", userCompany);
        }
        
        const snapshot = await getDocs(queryRef);
        const allAlerts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AlertData[];
        
        // Filter for active alerts
        const activeFilteredAlerts = allAlerts.filter(alert => 
          alert.status === "warning" || alert.status === "urgent"
        );
        
        console.log(`🚨 Dashboard: Successfully fetched ${activeFilteredAlerts.length} active alerts`);
        return activeFilteredAlerts;
      } catch (error) {
        console.error("🚨 Dashboard: Error fetching alerts:", error);
        throw error;
      }
    },
    enabled: !!userRole && !!company,
    retry: 1,
    staleTime: 30000,
  });

  // Fetch filters using direct Firebase calls
  const { data: filtersNeedingChange = [], isLoading: filtersLoading } = useQuery({
    queryKey: ["dashboard-filters", company, userRole],
    queryFn: async () => {
      console.log("🔧 Dashboard: Fetching filters data directly from Firebase...");
      
      try {
        const filtersRef = collection(db, "filters");
        let queryRef;
        
        if (userRole === 'technician' || userRole === 'superadmin') {
          // Technicians and superadmins can see all filters
          queryRef = filtersRef;
          console.log("🔧 Dashboard: Fetching all filters for", userRole);
        } else {
          // Other users filtered by company
          const userCompany = company || 'X-WATER';
          queryRef = query(filtersRef, where('company', '==', userCompany));
          console.log("🔧 Dashboard: Fetching filters for company:", userCompany);
        }
        
        const snapshot = await getDocs(queryRef);
        const allFilters = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as (FilterData & { status: string })[];
        
        // Filter for filters needing attention
        const filtersNeedingAttention = allFilters.filter(filter => 
          filter.status === "warning" || filter.status === "critical"
        );
        
        console.log(`🔧 Dashboard: Successfully fetched ${filtersNeedingAttention.length} filters needing change`);
        return filtersNeedingAttention;
      } catch (error) {
        console.error("🔧 Dashboard: Error fetching filters:", error);
        throw error;
      }
    },
    enabled: !!userRole && !!company,
    retry: 1,
    staleTime: 30000,
  });

  const totalVolume = units.reduce((sum, unit) => {
    const volume = typeof unit.total_volume === 'string' ? parseFloat(unit.total_volume) || 0 : unit.total_volume || 0;
    return sum + volume;
  }, 0);
  const formattedVolume = `${totalVolume}m³`;
  
  const isLoading = unitsLoading || alertsLoading || filtersLoading;
  const hasError = unitsError; // Only fail if units fail, since that's the most critical

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
