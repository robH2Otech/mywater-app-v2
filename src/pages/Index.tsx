
import { Bell, Droplets, Filter, TrendingUp } from "lucide-react";
import { useAllUnits, useAllAlerts, useAllFilters } from "@/hooks/useAllData";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { StatCard } from "@/components/dashboard/StatCard";
import { WaterUsageChart } from "@/components/dashboard/WaterUsageChart";
import { formatThousands } from "@/utils/measurements/formatUtils";
import { useEffect, useState } from "react";
import { fetchUnitTotalVolumes } from "@/utils/measurements/unitVolumeUtils";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { userRole, company } = useAuth();
  const [totalVolume, setTotalVolume] = useState(0);
  const [isVolumeLoading, setIsVolumeLoading] = useState(true);
  
  // Use simple data fetching - NO FILTERING, NO COMPLEX LOGIC
  const { data: units = [], isLoading: unitsLoading } = useAllUnits();
  const { data: alerts = [], isLoading: alertsLoading } = useAllAlerts();
  const { data: filters = [], isLoading: filtersLoading } = useAllFilters();
  
  console.log("Index page - Simple data fetch:", {
    userRole,
    company,
    unitsCount: units.length,
    alertsCount: alerts.length,
    filtersCount: filters.length,
    allUnits: units.map(u => ({ id: u.id, name: u.name, company: u.company }))
  });
  
  useEffect(() => {
    const loadTotalVolumes = async () => {
      if (units && units.length > 0) {
        setIsVolumeLoading(true);
        try {
          const totalVol = await fetchUnitTotalVolumes(units.map(unit => unit.id));
          setTotalVolume(totalVol);
        } catch (error) {
          console.error("Error fetching total volumes:", error);
        } finally {
          setIsVolumeLoading(false);
        }
      } else {
        setTotalVolume(0);
        setIsVolumeLoading(false);
      }
    };
    
    loadTotalVolumes();
  }, [units]);
  
  const isLoading = unitsLoading || alertsLoading || filtersLoading || isVolumeLoading;
  
  const formattedVolume = totalVolume ? `${formatThousands(totalVolume)}m³` : "0m³";

  return (
    <div className="space-y-6">
      <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
        <p className="text-green-300 text-sm">
          ✅ ALL DATA LOADED: {units.length} units, {alerts.length} alerts, {filters.length} filters 
          {userRole === 'superadmin' ? ' (Superadmin - All Companies)' : ` (${company})`}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Units"
          value={units.length.toString()}
          icon={<Droplets />}
          link="/units"
          iconColor="text-mywater-blue"
        />
        
        <StatCard
          title="Filter Changes Required"
          value={filters.length.toString()}
          icon={<Filter />}
          link="/filters"
          iconColor="text-yellow-500"
        />
        
        <StatCard
          title="Active Alerts"
          value={alerts.length.toString()}
          icon={<Bell />}
          link="/alerts"
          iconColor="text-red-500"
        />
        
        <StatCard
          title="Total Volume Today"
          value={formattedVolume}
          icon={<TrendingUp />}
          link="/analytics"
          iconColor="text-mywater-blue"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WaterUsageChart units={units} />
        <RecentAlerts />
      </div>
    </div>
  );
};

export default Index;
