
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData, AlertData } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";

export function useSimpleDashboard() {
  const { firebaseUser, userRole, company } = useAuth();

  // Fetch units
  const { data: units = [], isLoading: unitsLoading, error: unitsError } = useQuery({
    queryKey: ["simple-dashboard-units", userRole, firebaseUser?.uid],
    queryFn: async () => {
      console.log("📊 SimpleDashboard: Starting units fetch...");
      
      if (!firebaseUser) {
        console.log("❌ SimpleDashboard: No authenticated user");
        return [];
      }
      
      try {
        const unitsRef = collection(db, "units");
        const snapshot = await getDocs(unitsRef);
        
        let results = snapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            ...data
          } as UnitData;
        });
        
        // For superadmin: return ALL units
        if (userRole === 'superadmin') {
          console.log(`📊 SimpleDashboard: Superadmin fetched ${results.length} units (ALL)`);
          return results;
        }
        
        // For other users: filter by company
        if (company) {
          results = results.filter(unit => !unit.company || unit.company === company);
          console.log(`📊 SimpleDashboard: Filtered to ${results.length} units for company: ${company}`);
        }
        
        return results;
      } catch (error: any) {
        console.error("❌ SimpleDashboard: Units fetch failed:", error);
        throw error;
      }
    },
    enabled: !!firebaseUser,
    retry: 1,
    staleTime: 30000,
  });

  // Fetch alerts
  const { data: activeAlerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["simple-dashboard-alerts", userRole, firebaseUser?.uid],
    queryFn: async () => {
      console.log("🚨 SimpleDashboard: Starting alerts fetch...");
      
      if (!firebaseUser) {
        console.log("❌ SimpleDashboard: No authenticated user");
        return [];
      }
      
      try {
        const alertsRef = collection(db, "alerts");
        const snapshot = await getDocs(alertsRef);
        
        let allAlerts = snapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            ...data
          } as AlertData;
        });
        
        // For superadmin: return ALL alerts
        if (userRole === 'superadmin') {
          const activeFilteredAlerts = allAlerts.filter(alert => 
            alert.status === "warning" || alert.status === "urgent"
          );
          console.log(`🚨 SimpleDashboard: Superadmin fetched ${activeFilteredAlerts.length} alerts (ALL)`);
          return activeFilteredAlerts;
        }
        
        // For other users: filter by company
        if (company) {
          allAlerts = allAlerts.filter(alert => !alert.company || alert.company === company);
        }
        
        const activeFilteredAlerts = allAlerts.filter(alert => 
          alert.status === "warning" || alert.status === "urgent"
        );
        
        console.log(`🚨 SimpleDashboard: Fetched ${activeFilteredAlerts.length} active alerts`);
        return activeFilteredAlerts;
      } catch (error: any) {
        console.error("❌ SimpleDashboard: Alerts fetch failed:", error);
        throw error;
      }
    },
    enabled: !!firebaseUser,
    retry: 1,
    staleTime: 30000,
  });

  const totalVolume = units.reduce((sum, unit) => {
    const volume = typeof unit.total_volume === 'string' ? parseFloat(unit.total_volume) || 0 : unit.total_volume || 0;
    return sum + volume;
  }, 0);
  const formattedVolume = `${totalVolume}m³`;
  
  const isLoading = unitsLoading || alertsLoading;
  const hasError = unitsError;

  return {
    units,
    activeAlerts,
    formattedVolume,
    isLoading,
    hasError,
    company: company || 'X-WATER',
    userRole: userRole || 'technician',
  };
}
