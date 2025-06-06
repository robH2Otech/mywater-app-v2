
import { useQuery } from "@tanstack/react-query";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData, AlertData } from "@/types/analytics";
import { determineUnitStatus } from "@/utils/unitStatusUtils";

export function useDashboardData(company: string | null, userRole: string | null, isGlobalAccess: boolean) {
  // Fetch all units data with client-side filtering for better compatibility
  const { data: units = [], isLoading: isLoadingUnits, error: unitsError } = useQuery({
    queryKey: ["dashboard-units", company, userRole],
    queryFn: async () => {
      try {
        const unitsCollection = collection(db, "units");
        const unitsQuery = query(unitsCollection);
        
        const unitsSnapshot = await getDocs(unitsQuery);
        
        const allUnits = unitsSnapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          
          // Ensure total_volume is a number
          let totalVolume = data.total_volume;
          if (typeof totalVolume === 'string') {
            totalVolume = parseFloat(totalVolume);
          } else if (totalVolume === undefined || totalVolume === null) {
            totalVolume = 0;
          }
          
          // Recalculate status based on current volume
          const status = determineUnitStatus(totalVolume);
          
          return {
            id: doc.id,
            name: data.name,
            location: data.location,
            status: status, // Override with calculated status
            total_volume: totalVolume,
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
        
        console.log(`📊 Dashboard: Fetched ${filteredUnits.length} units for company: ${company}`);
        return filteredUnits;
      } catch (error) {
        console.error("Error fetching units:", error);
        throw error;
      }
    },
    enabled: !!userRole && !!company, // Only fetch when user role and company are available
  });

  // Fetch alerts data with client-side filtering
  const { data: alerts = [], isLoading: isLoadingAlerts, error: alertsError } = useQuery({
    queryKey: ["dashboard-alerts", company, userRole],
    queryFn: async () => {
      try {
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
            company: data.company || company // Use user's company if alert has no company field
          } as AlertData;
        });
        
        let filteredAlerts;
        if (isGlobalAccess) {
          // Superadmin sees all alerts
          filteredAlerts = allAlerts.filter(alert => 
            alert.status === "warning" || alert.status === "urgent"
          );
        } else {
          // Filter by company and status for other roles
          filteredAlerts = allAlerts.filter(alert => 
            (alert.status === "warning" || alert.status === "urgent") &&
            (!alert.company || alert.company === company)
          );
        }
        
        console.log(`🚨 Dashboard: Fetched ${filteredAlerts.length} alerts for company: ${company}`);
        return filteredAlerts;
      } catch (error) {
        console.error("Error fetching alerts:", error);
        throw error;
      }
    },
    enabled: !!userRole && !!company, // Only fetch when user role and company are available
  });

  // Calculate based on live data from processed units
  const activeUnits = units.filter((unit) => unit.status === "active").length;
  const warningUnits = units.filter((unit) => unit.status === "warning").length;
  const errorUnits = units.filter((unit) => unit.status === "urgent").length;

  // Enhanced helper function to calculate total volume from all units
  const calculateTotalVolume = (units: UnitData[]): number => {
    const total = units.reduce((sum, unit) => {
      // Ensure we're working with numbers
      let volume = 0;
      
      if (unit.total_volume !== undefined && unit.total_volume !== null) {
        volume = typeof unit.total_volume === 'string' 
          ? parseFloat(unit.total_volume) 
          : unit.total_volume;
      }
      
      // Skip NaN values
      if (isNaN(volume)) return sum;
      
      return sum + volume;
    }, 0);
    
    return total;
  };

  return {
    units,
    alerts,
    isLoadingUnits,
    isLoadingAlerts,
    unitsError,
    alertsError,
    activeUnits,
    warningUnits,
    errorUnits,
    calculateTotalVolume
  };
}
