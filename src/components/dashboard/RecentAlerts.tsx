
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Alert {
  id: string;
  unit_id: string;
  message: string;
  created_at: string;
  status: string;
  units: {
    name: string;
  } | null;
}

export const RecentAlerts = () => {
  const { data: alerts = [], isError } = useQuery({
    queryKey: ["recent-alerts"],
    queryFn: async () => {
      // Calculate date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("alerts")
        .select(`
          id,
          unit_id,
          message,
          created_at,
          status,
          units (
            name
          )
        `)
        .in("status", ["warning", "urgent"])
        .gte('created_at', sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching recent alerts:", error);
        throw error;
      }
      
      console.log("Recent alerts data:", data);
      // Remove duplicates based on message and unit_id combination
      const uniqueAlerts = data?.reduce((acc: Alert[], current) => {
        const exists = acc.some(
          alert => alert.message === current.message && alert.unit_id === current.unit_id
        );
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []) || [];

      return uniqueAlerts as Alert[];
    },
  });

  if (isError) {
    return <div>Error loading recent alerts</div>;
  }

  return (
    <Card className="p-6 glass">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Recent Alerts (Last 7 Days)</h2>
        <Bell className={`h-5 w-5 ${alerts.length > 0 ? 'text-red-500' : 'text-gray-400'}`} />
      </div>
      <div className="space-y-4">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-4 rounded-lg ${
                alert.status === 'urgent' ? 'bg-red-500/20' : 'bg-yellow-500/20'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-white">
                    {alert.units?.name || 'Unknown Unit'}
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
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400">No active alerts in the last 7 days</p>
          </div>
        )}
      </div>
    </Card>
  );
};
