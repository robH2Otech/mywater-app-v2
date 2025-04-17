import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Bell, MessageSquare, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { collection, query, getDocs, getDoc, doc, orderBy, limit, where, Timestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { fetchRecentRequests } from "@/services/requestService";
import { useState, useEffect } from "react";
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

export const RecentAlerts = () => {
  const navigate = useNavigate();
  const [clientRequests, setClientRequests] = useState<SupportRequest[]>([]);
  
  useEffect(() => {
    const loadClientRequests = async () => {
      try {
        const requests = await fetchRecentRequests(7);
        const filteredRequests = requests.filter(r => 
          r.status === 'new' || r.status === 'in_progress'
        );
        setClientRequests(filteredRequests);
      } catch (error) {
        console.error("Error loading recent client requests:", error);
      }
    };
    
    loadClientRequests();
  }, []);
  
  const { data: systemAlerts = [], isError, isLoading } = useQuery({
    queryKey: ["recent-alerts"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      try {
        console.log("Fetching recent system alerts...");
        
        const alertsCollection = collection(db, "alerts");
        const alertsQuery = query(
          alertsCollection,
          orderBy("created_at", "desc"),
          limit(5)
        );
        
        const alertsSnapshot = await getDocs(alertsQuery);
        const alertsData = alertsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Alert[];
        
        const enrichedAlerts = await Promise.all(alertsData.map(async (alert) => {
          if (alert.unit_id) {
            try {
              const unitDoc = await getDoc(doc(db, "units", alert.unit_id));
              
              if (unitDoc.exists()) {
                const unitData = unitDoc.data();
                return {
                  ...alert,
                  unit: {
                    name: unitData.name || "Unknown Unit"
                  }
                };
              }
            } catch (error) {
              console.error("Error fetching unit details:", error);
            }
          }
          return {
            ...alert,
            unit: { name: "Unknown Unit" }
          };
        }));
        
        const recentAlerts = enrichedAlerts.filter(alert => {
          if (!alert.created_at) return false;
          
          const alertDate = new Date(alert.created_at);
          const isRecent = alertDate >= sevenDaysAgo;
          const isActive = alert.status === 'warning' || alert.status === 'urgent';
          
          return isRecent && isActive;
        });
        
        const uniqueAlerts = recentAlerts.reduce((acc: Alert[], current) => {
          const exists = acc.some(
            alert => alert.message === current.message && alert.unit_id === current.unit_id
          );
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);

        return uniqueAlerts;
      } catch (error) {
        console.error("Error fetching recent alerts:", error);
        throw error;
      }
    },
  });

  const hasAlerts = (systemAlerts && systemAlerts.length > 0) || (clientRequests && clientRequests.length > 0);

  if (isError) {
    return <div>Error loading recent alerts</div>;
  }

  return (
    <Card 
      className="p-6 glass cursor-pointer hover:bg-white/5 transition-colors"
      onClick={() => navigate('/alerts')}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Recent Alerts (Last 7 Days)</h2>
        <div className="flex items-center gap-2">
          {systemAlerts && systemAlerts.length > 0 && (
            <Bell className="h-5 w-5 text-red-500" />
          )}
          {clientRequests && clientRequests.length > 0 && (
            <MessageSquare className="h-5 w-5 text-blue-500" />
          )}
        </div>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-gray-400">Loading alerts...</p>
          </div>
        ) : hasAlerts ? (
          <>
            {systemAlerts && systemAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg ${
                  alert.status === 'urgent' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-2 items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-400 mt-1 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-white">
                        {alert.unit?.name || 'Unknown Unit'}
                      </h3>
                      <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    alert.status === 'urgent' ? 'bg-red-500/30 text-red-200' : 'bg-yellow-500/30 text-yellow-200'
                  }`}>
                    {alert.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(alert.created_at || '').toLocaleDateString()}
                </p>
              </div>
            ))}
            
            {clientRequests.slice(0, 3).map((request) => (
              <div 
                key={request.id} 
                className="p-4 rounded-lg bg-blue-500/10"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-2 items-start">
                    <MessageSquare className="h-4 w-4 text-blue-400 mt-1 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-white">
                        {request.subject}
                      </h3>
                      <p className="text-sm text-gray-300 mt-1">From: {request.user_name}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    request.status === 'new' ? 'bg-orange-500/30 text-orange-200' : 'bg-blue-500/30 text-blue-200'
                  }`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {request.created_at && new Date(request.created_at).toLocaleDateString()}
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
