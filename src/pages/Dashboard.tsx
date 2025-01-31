import { useQuery } from "@tanstack/react-query";
import { Droplet, Bell, Calendar, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/dashboard/StatCard";
import { WaterUsageChart } from "@/components/dashboard/WaterUsageChart";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";

interface Unit {
  id: string;
  name: string;
  status: string;
}

export const Dashboard = () => {
  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase.from("units").select("*");
      if (error) throw error;
      return data as Unit[];
    },
  });

  const activeUnits = units.filter((unit) => unit.status === "active").length;
  const warningUnits = units.filter((unit) => unit.status === "warning").length;
  const errorUnits = units.filter((unit) => unit.status === "error").length;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Units"
          value={units.length}
          icon={Droplet}
          link="/units"
        />
        <StatCard
          title="Filter Changes Required"
          value={warningUnits}
          icon={Calendar}
          link="/filters"
          iconColor="text-yellow-500"
        />
        <StatCard
          title="Active Alerts"
          value={errorUnits}
          icon={Bell}
          link="/alerts"
          iconColor="text-red-500"
        />
        <StatCard
          title="Total Volume Today"
          value="106.0 m³"
          icon={Activity}
          link="/analytics"
          subValue="↑ 13.2%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WaterUsageChart />
        <RecentAlerts />
      </div>
    </div>
  );
};