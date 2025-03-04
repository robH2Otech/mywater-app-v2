
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

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
  const { data: alerts = [], isError } = useQuery({
    queryKey: ["recent-alerts"],
    queryFn: async () => {
      // Calculate date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get alerts
      const alertsCollection = collection(db, "alerts");
      const alertsQuery = query(
        alertsCollection,
        where("status", "in", ["warning", "urgent"]),
        where("created_at", ">=", sevenDaysAgo.toISOString()),
        orderBy("created_at", "desc"),
        limit(2)
      );
      
      const alertsSnapshot = await getDocs(alertsQuery);
      const alertsData = alertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Alert[];
      
      // Get unit details for each alert
      const enrichedAlerts = await Promise.all(alertsData.map(async (alert) => {
        if (alert.unit_id) {
          const unitDoc = await getDocs(query(
            collection(db, "units"),
            where("id", "==", alert.unit_id),
            limit(1)
          ));
          
          if (!unitDoc.empty) {
            const unitData = unitDoc.docs[0].data();
            return {
              ...alert,
              unit: {
                name: unitData.name
              }
            };
          }
        }
        return alert;
      }));
      
      console.log("Recent alerts data:", enrichedAlerts);
      
      // Remove duplicates based on message and unit_id combination
      const uniqueAlerts = enrichedAlerts.reduce((acc: Alert[], current) => {
        const exists = acc.some(
          alert => alert.message === current.message && alert.unit_id === current.unit_id
        );
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);

      return uniqueAlerts;
    },
  });

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
        <Bell className={`h-5 w-5 ${alerts.length > 0 ? 'text-red-500' : 'text-gray-400'}`} />
      </div>
      <div className="space-y-4">
        {alerts.length > 0 ? (
          <>
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg ${
                  alert.status === 'urgent' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">
                      {alert.unit?.name || 'Unknown Unit'}
                    </h3>
                    <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
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
