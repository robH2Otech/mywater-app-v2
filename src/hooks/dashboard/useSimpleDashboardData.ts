
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { AlertData, FilterData, UnitData } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";

export function useSimpleDashboardData() {
  const { company, userRole } = useAuth();
  const isSuperAdmin = userRole === 'superadmin';

  // Fetch units with company-filtered queries for security compliance
  const { data: units = [], isLoading: unitsLoading, error: unitsError } = useQuery({
    queryKey: ["dashboard-units", company, userRole],
    queryFn: async () => {
      console.log("📊 Dashboard: Fetching units data...");
      try {
        const unitsCollection = collection(db, "units");
        
        let unitsSnapshot;
        if (isSuperAdmin) {
          // Superadmins can fetch all data
          unitsSnapshot = await getDocs(unitsCollection);
        } else {
          // Non-superadmins use company-filtered query for security compliance
          const filterCompany = company || 'X-WATER';
          const unitsQuery = query(unitsCollection, where("company", "==", filterCompany));
          unitsSnapshot = await getDocs(unitsQuery);
        }
        
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
        
        console.log(`📊 Dashboard: Successfully fetched ${allUnits.length} units`);
        return allUnits;
      } catch (error) {
        console.error("📊 Dashboard: Error fetching units:", error);
        return [];
      }
    },
    enabled: !!userRole && !!company,
    retry: 1,
    staleTime: 30000,
  });

  // Fetch alerts with company-filtered queries
  const { data: activeAlerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["dashboard-alerts", company, userRole],
    queryFn: async () => {
      console.log("🚨 Dashboard: Fetching alerts data...");
      try {
        const alertsCollection = collection(db, "alerts");
        
        let alertsSnapshot;
        if (isSuperAdmin) {
          // Superadmins can fetch all data
          alertsSnapshot = await getDocs(alertsCollection);
        } else {
          // Non-superadmins use company-filtered query
          const filterCompany = company || 'X-WATER';
          const alertsQuery = query(alertsCollection, where("company", "==", filterCompany));
          alertsSnapshot = await getDocs(alertsQuery);
        }
        
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
        const filteredAlerts = allAlerts.filter(alert => 
          alert.status === "warning" || alert.status === "urgent"
        );
        
        console.log(`🚨 Dashboard: Successfully fetched ${filteredAlerts.length} alerts`);
        return filteredAlerts;
      } catch (error) {
        console.error("🚨 Dashboard: Error fetching alerts:", error);
        return [];
      }
    },
    enabled: !!userRole && !!company,
    retry: 1,
    staleTime: 30000,
  });

  // Fetch filters with company-filtered queries
  const { data: filtersNeedingChange = [], isLoading: filtersLoading } = useQuery({
    queryKey: ["dashboard-filters", company, userRole],
    queryFn: async () => {
      console.log("🔧 Dashboard: Fetching filters data...");
      try {
        const filtersCollection = collection(db, "filters");
        
        let filtersSnapshot;
        if (isSuperAdmin) {
          // Superadmins can fetch all data
          filtersSnapshot = await getDocs(filtersCollection);
        } else {
          // Non-superadmins use company-filtered query
          const filterCompany = company || 'X-WATER';
          const filtersQuery = query(filtersCollection, where("company", "==", filterCompany));
          filtersSnapshot = await getDocs(filtersQuery);
        }
        
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
        const filteredFilters = allFilters.filter(filter => 
          filter.status === "warning" || filter.status === "critical"
        );
        
        console.log(`🔧 Dashboard: Successfully fetched ${filteredFilters.length} filters needing change`);
        return filteredFilters;
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
