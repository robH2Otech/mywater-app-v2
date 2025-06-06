
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { AlertData, FilterData, UnitData } from "@/types/analytics";
import { fetchUnitTotalVolumes } from "@/utils/measurements/unitVolumeUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useDataFiltering } from "@/utils/auth/dataFiltering";
import { initializeUserClaims } from "@/utils/admin/adminClaimsManager";

export function useIndexPageData() {
  const [totalVolume, setTotalVolume] = useState<number>(0);
  const [isVolumeLoading, setIsVolumeLoading] = useState<boolean>(true);
  const [claimsInitialized, setClaimsInitialized] = useState<boolean>(false);
  const { company, userRole, refreshUserSession } = useAuth();
  const { isGlobalAccess } = useDataFiltering();
  
  // Initialize claims if missing
  useEffect(() => {
    const initializeClaims = async () => {
      if (!userRole && !claimsInitialized) {
        console.log("🔧 Index: No user role found, attempting to initialize claims...");
        try {
          const initialized = await initializeUserClaims();
          if (initialized) {
            console.log("✅ Index: Claims initialized, refreshing session...");
            await refreshUserSession();
          }
          setClaimsInitialized(true);
        } catch (error) {
          console.error("❌ Index: Error initializing claims:", error);
          setClaimsInitialized(true);
        }
      }
    };
    
    initializeClaims();
  }, [userRole, claimsInitialized, refreshUserSession]);
  
  // Enhanced query with retry logic for permission errors
  const fetchWithRetry = async (queryFn: () => Promise<any>, maxRetries = 2): Promise<any> => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await queryFn();
      } catch (error: any) {
        if (error.code === 'permission-denied' && attempt < maxRetries) {
          console.log(`🔄 Index: Permission denied, retrying... (attempt ${attempt + 1})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        throw error;
      }
    }
  };
  
  // Fetch units data with enhanced error handling
  const { 
    data: units = [], 
    isLoading: unitsLoading,
    error: unitsError
  } = useQuery({
    queryKey: ["index-units", company, userRole, claimsInitialized],
    queryFn: async () => {
      return fetchWithRetry(async () => {
        console.log("📊 Index: Fetching units data...");
        const unitsCollection = collection(db, "units");
        const unitsQuery = query(unitsCollection);
        
        const unitsSnapshot = await getDocs(unitsQuery);
        const allUnits = unitsSnapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            name: data.name,
            status: data.status,
            location: data.location,
            total_volume: data.total_volume,
            last_maintenance: data.last_maintenance,
            next_maintenance: data.next_maintenance,
            setup_date: data.setup_date,
            uvc_hours: data.uvc_hours,
            uvc_status: data.uvc_status,
            uvc_installation_date: data.uvc_installation_date,
            is_uvc_accumulated: data.is_uvc_accumulated,
            contact_name: data.contact_name,
            contact_email: data.contact_email,
            contact_phone: data.contact_phone,
            notes: data.notes,
            created_at: data.created_at,
            updated_at: data.updated_at,
            eid: data.eid,
            iccid: data.iccid,
            unit_type: data.unit_type,
            company: data.company || company
          } as UnitData;
        });
        
        // Simple filtering - if no role/company, show X-WATER units
        let filteredUnits;
        if (isGlobalAccess || userRole === 'superadmin') {
          filteredUnits = allUnits;
        } else {
          const filterCompany = company || 'X-WATER';
          filteredUnits = allUnits.filter(unit => 
            !unit.company || unit.company === filterCompany
          );
        }
        
        console.log(`📊 Index: Successfully fetched ${filteredUnits.length} units`);
        return filteredUnits;
      });
    },
    enabled: true, // Always try to fetch, even without role/company
    retry: false, // We handle retries manually
    staleTime: 30000, // Cache for 30 seconds
  });
  
  // Fetch alerts data with enhanced error handling
  const { 
    data: activeAlerts = [], 
    isLoading: alertsLoading,
    error: alertsError
  } = useQuery({
    queryKey: ["index-active-alerts", company, userRole, claimsInitialized],
    queryFn: async () => {
      return fetchWithRetry(async () => {
        console.log("🚨 Index: Fetching alerts data...");
        const alertsCollection = collection(db, "alerts");
        const alertsQuery = query(alertsCollection);
        
        const alertsSnapshot = await getDocs(alertsQuery);
        const allAlerts = alertsSnapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            unit_id: data.unit_id,
            message: data.message,
            status: data.status,
            created_at: data.created_at,
            updated_at: data.updated_at,
            company: data.company || company
          } as AlertData;
        });
        
        // Filter for active alerts
        let filteredAlerts;
        if (isGlobalAccess || userRole === 'superadmin') {
          filteredAlerts = allAlerts.filter(alert => 
            alert.status === "warning" || alert.status === "urgent"
          );
        } else {
          const filterCompany = company || 'X-WATER';
          filteredAlerts = allAlerts.filter(alert => 
            (alert.status === "warning" || alert.status === "urgent") &&
            (!alert.company || alert.company === filterCompany)
          );
        }
        
        console.log(`🚨 Index: Successfully fetched ${filteredAlerts.length} alerts`);
        return filteredAlerts;
      });
    },
    enabled: true,
    retry: false,
    staleTime: 30000,
  });
  
  // Fetch filters data with enhanced error handling
  const { 
    data: filtersNeedingChange = [], 
    isLoading: filtersLoading,
    error: filtersError
  } = useQuery({
    queryKey: ["index-filters-needing-change", company, userRole, claimsInitialized],
    queryFn: async () => {
      return fetchWithRetry(async () => {
        console.log("🔧 Index: Fetching filters data...");
        const filtersCollection = collection(db, "filters");
        const filtersQuery = query(filtersCollection);
        
        const filtersSnapshot = await getDocs(filtersQuery);
        const allFilters = filtersSnapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            unit_id: data.unit_id,
            installation_date: data.installation_date,
            last_change: data.last_change,
            next_change: data.next_change,
            volume_processed: data.volume_processed,
            contact_name: data.contact_name,
            email: data.email,
            phone: data.phone,
            notes: data.notes,
            created_at: data.created_at,
            updated_at: data.updated_at,
            status: data.status,
            company: data.company || company
          } as FilterData & { status: string };
        });
        
        // Filter for filters needing attention
        let filteredFilters;
        if (isGlobalAccess || userRole === 'superadmin') {
          filteredFilters = allFilters.filter(filter => 
            filter.status === "warning" || filter.status === "critical"
          );
        } else {
          const filterCompany = company || 'X-WATER';
          filteredFilters = allFilters.filter(filter => 
            (filter.status === "warning" || filter.status === "critical") &&
            (!filter.company || filter.company === filterCompany)
          );
        }
        
        console.log(`🔧 Index: Successfully fetched ${filteredFilters.length} filters needing change`);
        return filteredFilters;
      });
    },
    enabled: true,
    retry: false,
    staleTime: 30000,
  });
  
  // Calculate total volume from units
  useEffect(() => {
    const loadTotalVolumes = async () => {
      if (units && units.length > 0) {
        setIsVolumeLoading(true);
        try {
          const totalVol = await fetchUnitTotalVolumes(units.map(unit => unit.id));
          setTotalVolume(totalVol);
        } catch (error) {
          console.error("Error fetching total volumes:", error);
        } finally {
          setIsVolumeLoading(false);
        }
      } else {
        setTotalVolume(0);
        setIsVolumeLoading(false);
      }
    };
    
    loadTotalVolumes();
  }, [units]);

  const formattedVolume = totalVolume ? `${totalVolume}m³` : "0m³";
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
