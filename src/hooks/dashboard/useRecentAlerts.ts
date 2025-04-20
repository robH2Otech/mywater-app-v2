
import { useQuery } from "@tanstack/react-query";
import { collection, query, getDocs, getDoc, doc, orderBy, limit, where, Timestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { fetchRecentRequests } from "@/services/requestService";

// Unified type for displaying alerts in the dashboard
export interface DashboardAlert {
  id: string;
  title: string;
  message: string;
  status: string;
  created_at: Date;
  type: 'system' | 'request';
  source_id: string;
}

/**
 * Custom hook to fetch both system alerts and support requests from the last 7 days
 */
export const useRecentAlerts = () => {
  return useQuery({
    queryKey: ["dashboard-recent-alerts"],
    queryFn: async () => {
      // Calculate date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      try {
        console.log("Fetching both system alerts and client requests for dashboard...");
        const dashboardAlerts: DashboardAlert[] = [];
        
        // 1. Fetch system alerts
        await fetchSystemAlerts(sevenDaysAgo, dashboardAlerts);
        
        // 2. Fetch client support requests
        await fetchClientRequests(sevenDaysAgo, dashboardAlerts);
        
        console.log(`Combined alerts total: ${dashboardAlerts.length}`);
        
        // Sort all alerts by date (newest first) and limit to 5
        return dashboardAlerts
          .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
          .slice(0, 5);
        
      } catch (error) {
        console.error("Error fetching alerts for dashboard:", error);
        throw error;
      }
    },
  });
};

/**
 * Helper function to fetch system alerts
 */
async function fetchSystemAlerts(sevenDaysAgo: Date, dashboardAlerts: DashboardAlert[]) {
  const alertsCollection = collection(db, "alerts");
  const alertsQuery = query(
    alertsCollection,
    where("created_at", ">=", sevenDaysAgo),
    orderBy("created_at", "desc"),
    limit(10) // Fetch more to ensure we have enough after filtering
  );
  
  const alertsSnapshot = await getDocs(alertsQuery);
  console.log(`Retrieved ${alertsSnapshot.size} system alerts`);
  
  // Process system alerts
  const alertPromises = alertsSnapshot.docs.map(async (docSnapshot) => {
    const data = docSnapshot.data();
    let alertDate: Date;
    
    // Handle different date formats
    if (data.created_at instanceof Timestamp) {
      alertDate = data.created_at.toDate();
    } else if (typeof data.created_at === 'string') {
      alertDate = new Date(data.created_at);
    } else {
      alertDate = new Date();
    }
    
    // Only include alerts from the last 7 days
    if (alertDate >= sevenDaysAgo) {
      // Get unit details
      let unitName = "Unknown Unit";
      if (data.unit_id) {
        try {
          const unitDoc = await getDoc(doc(db, "units", data.unit_id));
          if (unitDoc.exists()) {
            const unitData = unitDoc.data();
            unitName = unitData.name || "Unknown Unit";
          }
        } catch (error) {
          console.error("Error fetching unit:", error);
        }
      }
      
      dashboardAlerts.push({
        id: docSnapshot.id,
        title: unitName,
        message: data.message || "No message",
        status: data.status || "warning",
        created_at: alertDate,
        type: 'system',
        source_id: docSnapshot.id
      });
    }
  });
  
  await Promise.all(alertPromises);
}

/**
 * Helper function to fetch support requests
 */
async function fetchClientRequests(sevenDaysAgo: Date, dashboardAlerts: DashboardAlert[]) {
  try {
    const requests = await fetchRecentRequests(7);
    console.log(`Retrieved ${requests.length} client requests for dashboard`);
    
    // Add client requests to dashboard alerts
    requests.forEach((request) => {
      let requestDate: Date;
      
      if (request.created_at instanceof Date) {
        requestDate = request.created_at;
      } else if (typeof request.created_at === 'string') {
        requestDate = new Date(request.created_at);
      } else {
        requestDate = new Date();
      }
      
      dashboardAlerts.push({
        id: `request-${request.id}`,
        title: request.subject || "Support Request",
        message: request.message || "No details",
        status: request.status === "new" ? "urgent" : "warning",
        created_at: requestDate,
        type: 'request',
        source_id: request.id
      });
    });
  } catch (error) {
    console.error("Error fetching client requests:", error);
  }
}
