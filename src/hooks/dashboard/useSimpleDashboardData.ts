
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { AlertData, FilterData, UnitData } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";

export function useSimpleDashboardData() {
  const { company, userRole } = useAuth();
  const isSuperAdmin = userRole === 'superadmin';
  const isTechnician = userRole === 'technician';

  // Fetch units - technicians and superadmins can see all data
  const { data: units = [], isLoading: unitsLoading, error: unitsError } = useQuery({
    queryKey: ["dashboard-units", company, userRole],
    queryFn: async () => {
      console.log("📊 Dashboard: Fetching units data...");
      try {
        const unitsCollection = collection(db, "units");
        const unitsQuery = query(unitsCollection, orderBy("name"));
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
        
        // Filter data based on role - technicians and superadmins see all
        let filteredUnits;
        if (isSuperAdmin || isTechnician) {
          filteredUnits = allUnits;
        } else {
          const filterCompany = company || 'X-WATER';
          filteredUnits = allUnits.filter(unit => 
            !unit.company || unit.company === filterCompany
          );
        }
        
        console.log(`📊 Dashboard: Successfully fetched ${filteredUnits.length} units`);
        return filteredUnits;
      } catch (error) {
        console.error("📊 Dashboard: Error fetching units:", error);
        return [];
      }
    },
    enabled: !!userRole && !!company,
    retry: 1,
    staleTime: 30000,
  });

  // Fetch alerts - technicians and superadmins can see all data
  const { data: activeAlerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["dashboard-alerts", company, userRole],
    queryFn: async () => {
      console.log("🚨 Dashboard: Fetching alerts data...");
      try {
        const alertsCollection = collection(db, "alerts");
        const alertsSnapshot = await getDocs(alertsCollection);
        
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
        
        // Filter data based on role - technicians and superadmins see all
        let filteredAlerts;
        if (isSuperAdmin || isTechnician) {
          filteredAlerts = allAlerts;
        } else {
          const filterCompany = company || 'X-WATER';
          filteredAlerts = allAlerts.filter(alert => 
            !alert.company || alert.company === filterCompany
          );
        }
        
        // Filter for active alerts
        const activeFilteredAlerts = filteredAlerts.filter(alert => 
          alert.status === "warning" || alert.status === "urgent"
        );
        
        console.log(`🚨 Dashboard: Successfully fetched ${activeFilteredAlerts.length} alerts`);
        return activeFilteredAlerts;
      } catch (error) {
        console.error("🚨 Dashboard: Error fetching alerts:", error);
        return [];
      }
    },
    enabled: !!userRole && !!company,
    retry: 1,
    staleTime: 30000,
  });

  // Fetch filters - technicians and superadmins can see all data
  const { data: filtersNeedingChange = [], isLoading: filtersLoading } = useQuery({
    queryKey: ["dashboard-filters", company, userRole],
    queryFn: async () => {
      console.log("🔧 Dashboard: Fetching filters data...");
      try {
        const filtersCollection = collection(db, "filters");
        const filtersSnapshot = await getDocs(filtersCollection);
        
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
        
        // Filter data based on role - technicians and superadmins see all
        let filteredFilters;
        if (isSuperAdmin || isTechnician) {
          filteredFilters = allFilters;
        } else {
          const filterCompany = company || 'X-WATER';
          filteredFilters = allFilters.filter(filter => 
            !filter.company || filter.company === filterCompany
          );
        }
        
        // Filter for filters needing attention
        const filtersNeedingAttention = filteredFilters.filter(filter => 
          filter.status === "warning" || filter.status === "critical"
        );
        
        console.log(`🔧 Dashboard: Successfully fetched ${filtersNeedingAttention.length} filters needing change`);
        return filtersNeedingAttention;
      } catch (error) {
        console.error("🔧 Dashboard: Error fetching filters:", error);
        return [];
      }
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
