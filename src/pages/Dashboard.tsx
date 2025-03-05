
import { useQuery } from "@tanstack/react-query";
import { Droplet, Bell, Calendar, Activity } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { WaterUsageChart } from "@/components/dashboard/WaterUsageChart";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";

export const Dashboard = () => {
  const { data: units = [], isLoading: isLoadingUnits } = useQuery({
    queryKey: ["dashboard-units"],
    queryFn: async () => {
      const unitsCollection = collection(db, "units");
      const unitsSnapshot = await getDocs(unitsCollection);
      
      return unitsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UnitData[];
    },
  });

  const { data: alerts = [], isLoading: isLoadingAlerts } = useQuery({
    queryKey: ["dashboard-alerts"],
    queryFn: async () => {
      const alertsCollection = collection(db, "alerts");
      const alertsQuery = query(
        alertsCollection,
        where("status", "in", ["warning", "urgent"])
      );
      const alertsSnapshot = await getDocs(alertsQuery);
      
      return alertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
  });

  const activeUnits = units.filter((unit) => unit.status === "active").length;
  const warningUnits = units.filter((unit) => unit.status === "warning").length;
  const errorUnits = units.filter((unit) => unit.status === "urgent").length;

  if (isLoadingUnits || isLoadingAlerts) {
    return <div className="flex justify-center p-12">Loading dashboard data...</div>;
  }

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
          value={alerts.length}
          icon={Bell}
          link="/alerts"
          iconColor="text-red-500"
        />
        <StatCard
          title="Total Volume Today"
          value={`${calculateTotalVolume(units)} m³`}
          icon={Activity}
          link="/analytics"
          subValue={`${units.length > 0 ? '↑ 13.2%' : '-'}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WaterUsageChart units={units} />
        <RecentAlerts />
      </div>
    </div>
  );
};

// Helper function to calculate total volume from all units
function calculateTotalVolume(units: UnitData[]): string {
  const total = units.reduce((sum, unit) => {
    const volume = unit.total_volume ? parseFloat(unit.total_volume.toString()) : 0;
    return sum + volume;
  }, 0);
  
  return total.toFixed(1);
}
