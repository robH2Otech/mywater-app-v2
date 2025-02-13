
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";

const Index = () => {
  const { data: alerts = [], isError } = useQuery({
    queryKey: ["active-alerts"],
    queryFn: async () => {
      console.log("Fetching active alerts...");
      const { data, error } = await supabase
        .from("alerts")
        .select("*, units(name)")
        .in("status", ["warning", "urgent"])  // Only get warning and urgent alerts
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching alerts:", error);
        throw error;
      }
      
      console.log("Active alerts data:", data);
      return data || [];
    },
  });

  // Get active alerts count (warning + urgent)
  const activeAlertsCount = Array.isArray(alerts) ? alerts.length : 0;
  const bellColor = activeAlertsCount > 0 ? "text-red-500" : "text-gray-400";

  if (isError) {
    console.error("Error loading alerts");
    return <div>Error loading alerts</div>;
  }

  return (
    <div className="min-h-screen bg-spotify-darker p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="p-8 glass">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">MYWATER Technologies</h1>
            <div className="flex items-center justify-center gap-2 text-2xl">
              <Bell className={`h-6 w-6 ${bellColor}`} />
              <p className="text-white">Active Alerts: {activeAlertsCount}</p>
            </div>
            <p className="text-xl text-gray-400">Monitor and manage your water systems</p>
          </div>
        </Card>
        
        <div className="mt-8">
          <RecentAlerts />
        </div>
      </div>
    </div>
  );
};

export default Index;
