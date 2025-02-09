
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

const Index = () => {
  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .in("status", ["warning", "urgent"]);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-spotify-darker">
      <Card className="p-8 glass">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">MYWATER Technologies</h1>
          <div className="flex items-center justify-center gap-2 text-2xl">
            <Bell className="h-6 w-6 text-red-500" />
            <p className="text-white">Active Alerts: {alerts.length}</p>
          </div>
          <p className="text-xl text-gray-400">Monitor and manage your water systems</p>
        </div>
      </Card>
    </div>
  );
};

export default Index;
