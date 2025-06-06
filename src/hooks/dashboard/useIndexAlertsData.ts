
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { AlertData } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";
import { useDataFiltering } from "@/utils/auth/dataFiltering";
import { fetchWithRetry } from "@/utils/dashboard/fetchRetryUtil";

export function useIndexAlertsData(claimsInitialized: boolean) {
  const { company, userRole } = useAuth();
  const { isGlobalAccess } = useDataFiltering();

  return useQuery({
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
}
