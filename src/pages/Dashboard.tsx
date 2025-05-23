
import { useQuery } from "@tanstack/react-query";
import { Droplet, Bell, Calendar, Activity } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { WaterUsageChart } from "@/components/dashboard/WaterUsageChart";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";
import { determineUnitStatus } from "@/utils/unitStatusUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatThousands } from "@/utils/measurements/formatUtils";

const Dashboard = () => {
  const { t } = useLanguage();

  // Fetch all units data
  const { data: units = [], isLoading: isLoadingUnits } = useQuery({
    queryKey: ["dashboard-units"],
    queryFn: async () => {
      const unitsCollection = collection(db, "units");
      const unitsSnapshot = await getDocs(unitsCollection);
      
      const processedUnits = unitsSnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Ensure total_volume is a number
        let totalVolume = data.total_volume;
        if (typeof totalVolume === 'string') {
          totalVolume = parseFloat(totalVolume);
        } else if (totalVolume === undefined || totalVolume === null) {
          totalVolume = 0;
        }
        
        // Recalculate status based on current volume
        const status = determineUnitStatus(totalVolume);
        
        return {
          id: doc.id,
          ...data,
          total_volume: totalVolume,
          status: status // Override with calculated status
        };
      }) as UnitData[];
      
      return processedUnits;
    },
  });

  // Fetch alerts data
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

  // Calculate based on live data from processed units
  const activeUnits = units.filter((unit) => unit.status === "active").length;
  const warningUnits = units.filter((unit) => unit.status === "warning").length;
  const errorUnits = units.filter((unit) => unit.status === "urgent").length;

  if (isLoadingUnits || isLoadingAlerts) {
    return <div className="flex justify-center p-12">{t("dashboard.loading")}</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("dashboard.total.units")}
          value={units.length}
          icon={Droplet}
          link="/units"
        />
        <StatCard
          title={t("dashboard.filter.changes")}
          value={warningUnits}
          icon={Calendar}
          link="/filters"
          iconColor="text-yellow-500"
        />
        <StatCard
          title={t("dashboard.active.alerts")}
          value={alerts.length}
          icon={Bell}
          link="/alerts"
          iconColor="text-red-500"
        />
        <StatCard
          title={t("dashboard.volume.today")}
          value={`${formatThousands(calculateTotalVolume(units))} m³`}
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

// Enhanced helper function to calculate total volume from all units
function calculateTotalVolume(units: UnitData[]): number {
  const total = units.reduce((sum, unit) => {
    // Ensure we're working with numbers
    let volume = 0;
    
    if (unit.total_volume !== undefined && unit.total_volume !== null) {
      volume = typeof unit.total_volume === 'string' 
        ? parseFloat(unit.total_volume) 
        : unit.total_volume;
    }
    
    // Skip NaN values
    if (isNaN(volume)) return sum;
    
    return sum + volume;
  }, 0);
  
  return total;
}

export default Dashboard;
