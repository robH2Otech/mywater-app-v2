
import { useAuth } from "@/contexts/AuthContext";
import { useClaimsInitialization } from "./useClaimsInitialization";
import { useIndexUnitsData } from "./useIndexUnitsData";
import { useIndexAlertsData } from "./useIndexAlertsData";
import { useIndexFiltersData } from "./useIndexFiltersData";
import { useIndexVolumeData } from "./useIndexVolumeData";

export function useRefactoredIndexPageData() {
  const { company, userRole } = useAuth();
  const { claimsInitialized } = useClaimsInitialization();
  
  // Fetch all data types
  const { 
    data: units = [], 
    isLoading: unitsLoading,
    error: unitsError
  } = useIndexUnitsData(claimsInitialized);
  
  const { 
    data: activeAlerts = [], 
    isLoading: alertsLoading,
    error: alertsError
  } = useIndexAlertsData(claimsInitialized);
  
  const { 
    data: filtersNeedingChange = [], 
    isLoading: filtersLoading,
    error: filtersError
  } = useIndexFiltersData(claimsInitialized);

  const { formattedVolume, isVolumeLoading } = useIndexVolumeData(units);
  
  const isLoading = unitsLoading || alertsLoading || filtersLoading || isVolumeLoading;
  const hasError = unitsError || alertsError || filtersError;

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
