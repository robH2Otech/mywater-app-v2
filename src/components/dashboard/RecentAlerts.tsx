
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { collection, query, getDocs, getDoc, doc, orderBy, limit, where, Timestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { fetchRecentRequests } from "@/services/requestService";
import { SupportRequest } from "@/types/supportRequests";

interface Alert {
  id: string;
  unit_id: string;
  message: string;
  created_at: string;
  status: string;
  unit?: {
    name: string;
  };
}

// Unified type for displaying alerts in the dashboard
interface DashboardAlert {
  id: string;
  title: string;
  message: string;
  status: string;
  created_at: Date;
  type: 'system' | 'request';
  source_id: string;
}

export const RecentAlerts = () => {
  const navigate = useNavigate();

  // Fetch both system alerts and client requests
  const { data: combinedAlerts = [], isError, isLoading } = useQuery({
    queryKey: ["dashboard-recent-alerts"],
    queryFn: async () => {
      // Calculate date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      try {
        console.log("Fetching both system alerts and client requests for dashboard...");
        const dashboardAlerts: DashboardAlert[] = [];
        
        // 1. Fetch system alerts
        const alertsCollection = collection(db, "alerts");
        const alertsQuery = query(
          alertsCollection,
          where("status", "in", ["warning", "urgent"]),
          orderBy("created_at", "desc"),
          limit(10) // Fetch more to ensure we have enough after filtering
        );
        
        const alertsSnapshot = await getDocs(alertsQuery);
        console.log(`Retrieved ${alertsSnapshot.size} system alerts`);
        
        // Process system alerts
        const alertPromises = alertsSnapshot.docs.map(async (doc) => {
          const data = doc.data();
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
                  unitName = unitDoc.data().name || "Unknown Unit";
                }
              } catch (error) {
                console.error("Error fetching unit:", error);
              }
            }
            
            dashboardAlerts.push({
              id: doc.id,
              title: unitName,
              message: data.message || "No message",
              status: data.status || "warning",
              created_at: alertDate,
              type: 'system',
              source_id: doc.id
            });
          }
        });
        
        await Promise.all(alertPromises);
        
        // 2. Fetch client support requests
        try {
          const requests = await fetchRecentRequests(7);
          console.log(`Retrieved ${requests.length} client requests`);
          
          // Add client requests to dashboard alerts
          requests.forEach(request => {
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

  const handleAlertClick = () => {
    navigate('/alerts');
  };

  if (isError) {
    return <div>Error loading recent alerts</div>;
  }

  return (
    <Card 
      className="p-6 glass cursor-pointer hover:bg-white/5 transition-colors"
      onClick={handleAlertClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Recent Alerts (Last 7 Days)</h2>
        <Bell className={`h-5 w-5 ${combinedAlerts.length > 0 ? 'text-red-500' : 'text-gray-400'}`} />
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-gray-400">Loading alerts...</p>
          </div>
        ) : combinedAlerts.length > 0 ? (
          <>
            {combinedAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg ${
                  alert.status === 'urgent' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">
                      {alert.title}
                    </h3>
                    <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    alert.status === 'urgent' ? 'bg-red-500/30 text-red-200' : 'bg-yellow-500/30 text-yellow-200'
                  }`}>
                    {alert.type === 'request' ? 'Support Request' : alert.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {alert.created_at.toLocaleDateString()}
                </p>
              </div>
            ))}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-400 hover:text-gray-300">
                Click to view all alerts →
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400">No active alerts in the last 7 days</p>
          </div>
        )}
      </div>
    </Card>
  );
};
