import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Alert {
  id: string;
  unit_id: string;
  message: string;
  created_at: string;
}

export const RecentAlerts = () => {
  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as Alert[];
    },
  });

  return (
    <Card className="p-6 glass">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Alerts</h2>
        <Bell className="h-5 w-5 text-red-500" />
      </div>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-4 rounded-lg bg-spotify-accent/30">
            <h3 className="font-semibold">Alert #{alert.id.slice(0, 8)}</h3>
            <p className="text-sm text-gray-400 mt-1">{alert.message}</p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(alert.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
        {alerts.length === 0 && (
          <p className="text-gray-400 text-center py-4">No recent alerts</p>
        )}
      </div>
    </Card>
  );
};