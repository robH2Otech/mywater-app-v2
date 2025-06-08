
import { useQuery } from "@tanstack/react-query";
import { AlertData, FilterData, UnitData } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";
import { secureDataFetch } from "@/utils/firebase/secureDataFetcher";

export function useSimpleDashboardData() {
  const { company, userRole } = useAuth();

  // Fetch units using secure data fetching
  const { data: units = [], isLoading: unitsLoading, error: unitsError } = useQuery({
    queryKey: ["dashboard-units", company, userRole],
    queryFn: async () => {
      console.log("📊 Dashboard: Fetching units data securely...");
      return await secureDataFetch<UnitData>({
        userRole,
        company,
        collectionName: "units",
        orderByField: "name"
      });
    },
    enabled: !!userRole && !!company,
    retry: 1,
    staleTime: 30000,
  });

  // Fetch alerts using secure data fetching
  const { data: activeAlerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["dashboard-alerts", company, userRole],
    queryFn: async () => {
      console.log("🚨 Dashboard: Fetching alerts data securely...");
      const allAlerts = await secureDataFetch<AlertData>({
        userRole,
        company,
        collectionName: "alerts"
      });
      
      // Filter for active alerts
      const activeFilteredAlerts = allAlerts.filter(alert => 
        alert.status === "warning" || alert.status === "urgent"
      );
      
      console.log(`🚨 Dashboard: Successfully fetched ${activeFilteredAlerts.length} active alerts`);
      return activeFilteredAlerts;
    },
    enabled: !!userRole && !!company,
    retry: 1,
    staleTime: 30000,
  });

  // Fetch filters using secure data fetching
  const { data: filtersNeedingChange = [], isLoading: filtersLoading } = useQuery({
    queryKey: ["dashboard-filters", company, userRole],
    queryFn: async () => {
      console.log("🔧 Dashboard: Fetching filters data securely...");
      const allFilters = await secureDataFetch<FilterData & { status: string }>({
        userRole,
        company,
        collectionName: "filters"
      });
      
      // Filter for filters needing attention
      const filtersNeedingAttention = allFilters.filter(filter => 
        filter.status === "warning" || filter.status === "critical"
      );
      
      console.log(`🔧 Dashboard: Successfully fetched ${filtersNeedingAttention.length} filters needing change`);
      return filtersNeedingAttention;
    },
    enabled: !!userRole && !!company,
    retry: 1,
    staleTime: 30000,
  });

  const totalVolume = units.reduce((sum, unit) => sum + (unit.total_volume || 0), 0);
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
