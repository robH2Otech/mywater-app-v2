
import { useQuery } from "@tanstack/react-query";
import { Bell, Droplets, Filter, Lightbulb, TrendingUp } from "lucide-react";
import { useUnits } from "@/hooks/useUnits";
import { Card } from "@/components/ui/card";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { StatCard } from "@/components/dashboard/StatCard";
import { WaterUsageChart } from "@/components/dashboard/WaterUsageChart";
import { WelcomeMessage } from "@/components/layout/WelcomeMessage";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

const Index = () => {
  // Get units data
  const { data: units = [], isLoading: unitsLoading } = useUnits();
  
  // Get active alerts count
  const { data: activeAlerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["active-alerts-count"],
    queryFn: async () => {
      console.log("Fetching active alerts count...");
      // Calculate date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      try {
        const alertsQuery = query(
          collection(db, "alerts"),
          where("status", "in", ["warning", "urgent"])
        );
        
        const alertsSnapshot = await getDocs(alertsQuery);
        return alertsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error("Error fetching alert count:", error);
        return [];
      }
    },
  });
  
  // Get filter changes required
  const { data: filtersNeedingChange = [], isLoading: filtersLoading } = useQuery({
    queryKey: ["filters-needing-change"],
    queryFn: async () => {
      try {
        const filtersQuery = query(
          collection(db, "filters"),
          where("status", "in", ["warning", "critical"])
        );
        
        const filtersSnapshot = await getDocs(filtersQuery);
        return filtersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error("Error fetching filters needing change:", error);
        return [];
      }
    },
  });
  
  // Calculate the total volume for today
  const { data: totalVolumeData, isLoading: volumeLoading } = useQuery({
    queryKey: ["total-volume-today"],
    queryFn: async () => {
      try {
        // Calculate total from all units
        const totalVolume = units.reduce((sum, unit) => {
          return sum + (typeof unit.total_volume === 'number' ? unit.total_volume : 0);
        }, 0);
        
        // For the percentage increase, we would need historical data
        // Using a random percentage increase for demonstration
        const percentageIncrease = 13.2;
        
        return {
          volume: totalVolume,
          percentageIncrease
        };
      } catch (error) {
        console.error("Error calculating total volume:", error);
        return { volume: 0, percentageIncrease: 0 };
      }
    },
    enabled: !unitsLoading,
  });
  
  const isLoading = unitsLoading || alertsLoading || filtersLoading || volumeLoading;
  
  // Prepare volume display with m³ superscript
  const formattedVolume = totalVolumeData?.volume
    ? `${totalVolumeData.volume.toLocaleString()} m`
    : "0 m";
    
  // Format percentage with + sign if positive
  const formattedPercentage = totalVolumeData?.percentageIncrease
    ? `${totalVolumeData.percentageIncrease > 0 ? '+' : ''}${totalVolumeData.percentageIncrease.toFixed(1)}%`
    : "0%";
  
  const percentageColor = totalVolumeData?.percentageIncrease && totalVolumeData.percentageIncrease > 0
    ? "text-mywater-blue"
    : "text-red-500";

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <WelcomeMessage firstName="" />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Units"
          value={units.length.toString()}
          icon={Droplets}
          link="/units"
          iconColor="text-mywater-blue"
        />
        
        <StatCard
          title="Filter Changes Required"
          value={filtersNeedingChange.length.toString()}
          icon={Filter}
          link="/filters"
          iconColor="text-yellow-500"
        />
        
        <StatCard
          title="Active Alerts"
          value={activeAlerts.length.toString()}
          icon={Bell}
          link="/alerts"
          iconColor="text-red-500"
        />
        
        <StatCard
          title="Total Volume Today"
          value={formattedVolume}
          icon={TrendingUp}
          link="/analytics"
          iconColor="text-mywater-blue"
          subValue={formattedPercentage}
          subValueColor={percentageColor}
        />
      </div>
      
      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WaterUsageChart units={units} />
        <RecentAlerts />
      </div>
    </div>
  );
};

export default Index;
