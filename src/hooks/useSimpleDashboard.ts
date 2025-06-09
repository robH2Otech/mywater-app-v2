
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
      console.log("📊 SimpleDashboard: Auth state:", { 
        userRole, 
        company, 
        userEmail: firebaseUser?.email,
        uid: firebaseUser?.uid 
      });
      
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
        
        console.log(`📊 SimpleDashboard: Fetched ${results.length} total units from Firebase`);
        
        // SUPERADMIN GETS ALL DATA - NO FILTERING AT ALL
        if (userRole === 'superadmin') {
          console.log(`✅ SimpleDashboard: SUPERADMIN - Returning ALL ${results.length} units (NO FILTERING)`);
          return results;
        }
        
        // For non-superadmin users: apply company filtering
        if (company) {
          const originalLength = results.length;
          results = results.filter(unit => !unit.company || unit.company === company);
          console.log(`📊 SimpleDashboard: Non-superadmin filtered from ${originalLength} to ${results.length} units for company: ${company}`);
        } else {
          console.log("⚠️ SimpleDashboard: No company set for non-superadmin user");
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
  const { data: activeAlerts = [], isLoading: alertsLoading, error: alertsError } = useQuery({
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
        
        console.log(`🚨 SimpleDashboard: Fetched ${allAlerts.length} total alerts from Firebase`);
        
        // SUPERADMIN GETS ALL ALERTS - NO FILTERING
        if (userRole === 'superadmin') {
          const activeFilteredAlerts = allAlerts.filter(alert => 
            alert.status === "warning" || alert.status === "urgent"
          );
          console.log(`✅ SimpleDashboard: SUPERADMIN - Returning ${activeFilteredAlerts.length} active alerts (NO COMPANY FILTERING)`);
          return activeFilteredAlerts;
        }
        
        // For non-superadmin users: apply company filtering
        if (company) {
          const originalLength = allAlerts.length;
          allAlerts = allAlerts.filter(alert => !alert.company || alert.company === company);
          console.log(`🚨 SimpleDashboard: Non-superadmin filtered from ${originalLength} to ${allAlerts.length} alerts for company: ${company}`);
        }
        
        const activeFilteredAlerts = allAlerts.filter(alert => 
          alert.status === "warning" || alert.status === "urgent"
        );
        
        console.log(`🚨 SimpleDashboard: Returning ${activeFilteredAlerts.length} active alerts`);
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
  const hasError = unitsError || alertsError;

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
