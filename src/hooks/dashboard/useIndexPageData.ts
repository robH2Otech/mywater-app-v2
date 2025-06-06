
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { AlertData, FilterData, UnitData } from "@/types/analytics";
import { fetchUnitTotalVolumes } from "@/utils/measurements/unitVolumeUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useDataFiltering } from "@/utils/auth/dataFiltering";

export function useIndexPageData() {
  const [totalVolume, setTotalVolume] = useState<number>(0);
  const [isVolumeLoading, setIsVolumeLoading] = useState<boolean>(true);
  const { company, userRole } = useAuth();
  const { isGlobalAccess } = useDataFiltering();
  
  // Fetch units data
  const { 
    data: units = [], 
    isLoading: unitsLoading,
    error: unitsError
  } = useQuery({
    queryKey: ["index-units", company, userRole],
    queryFn: async () => {
      try {
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
            company: data.company || company // Use user's company if unit has no company field
          } as UnitData;
        });
        
        // Filter units based on user role
        let filteredUnits;
        if (isGlobalAccess) {
          // Superadmin sees all units
          filteredUnits = allUnits;
        } else {
          // Filter by company for other roles - include units with no company field
          filteredUnits = allUnits.filter(unit => 
            !unit.company || unit.company === company
          );
        }
        
        console.log(`📊 Index: Fetched ${filteredUnits.length} units for company: ${company}, role: ${userRole}`);
        return filteredUnits;
      } catch (error) {
        console.error("Error fetching units:", error);
        throw error;
      }
    },
    enabled: !!userRole && !!company, // Only fetch when user role and company are available
  });
  
  // Fetch alerts data
  const { 
    data: activeAlerts = [], 
    isLoading: alertsLoading,
    error: alertsError
  } = useQuery({
    queryKey: ["index-active-alerts", company, userRole],
    queryFn: async () => {
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
      
      // Filter client-side for better compatibility
      let filteredAlerts;
      if (isGlobalAccess) {
        filteredAlerts = allAlerts.filter(alert => 
          alert.status === "warning" || alert.status === "urgent"
        );
      } else {
        filteredAlerts = allAlerts.filter(alert => 
          (alert.status === "warning" || alert.status === "urgent") &&
          (!alert.company || alert.company === company)
        );
      }
      
      return filteredAlerts;
    },
    enabled: !!userRole && !!company,
  });
  
  // Fetch filters data
  const { 
    data: filtersNeedingChange = [], 
    isLoading: filtersLoading,
    error: filtersError
  } = useQuery({
    queryKey: ["index-filters-needing-change", company, userRole],
    queryFn: async () => {
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
          company: data.company || company // Use user's company if filter has no company field
        } as FilterData & { status: string };
      });
      
      // Filter client-side for better compatibility
      let filteredFilters;
      if (isGlobalAccess) {
        filteredFilters = allFilters.filter(filter => 
          filter.status === "warning" || filter.status === "critical"
        );
      } else {
        filteredFilters = allFilters.filter(filter => 
          (filter.status === "warning" || filter.status === "critical") &&
          (!filter.company || filter.company === company)
        );
      }
      
      return filteredFilters;
    },
    enabled: !!userRole && !!company,
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
    company,
    userRole,
  };
}
