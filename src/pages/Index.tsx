
import { useQuery } from "@tanstack/react-query";
import { Bell, Droplets, Filter, Lightbulb, TrendingUp } from "lucide-react";
import { useUnits } from "@/hooks/useUnits";
import { Card } from "@/components/ui/card";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { StatCard } from "@/components/dashboard/StatCard";
import { WaterUsageChart } from "@/components/dashboard/WaterUsageChart";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { formatThousands } from "@/utils/measurements/formatUtils";
import { useEffect, useState } from "react";
import { fetchUnitTotalVolumes } from "@/utils/measurements/unitVolumeUtils";

const Index = () => {
  const [totalVolume, setTotalVolume] = useState(0);
  const [percentageIncrease, setPercentageIncrease] = useState(13.2);
  const [isVolumeLoading, setIsVolumeLoading] = useState(true);
  
  // Get units data
  const { data: units = [], isLoading: unitsLoading } = useUnits();
  
  // Fetch total volumes immediately on component mount
  useEffect(() => {
    const loadTotalVolumes = async () => {
      if (units && units.length > 0) {
        setIsVolumeLoading(true);
        try {
          // Get all unit volumes directly from their documents
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
  
  const isLoading = unitsLoading || alertsLoading || filtersLoading || isVolumeLoading;
  
  // Format volume with commas for thousands
  const formattedVolume = totalVolume ? `${formatThousands(totalVolume)} m` : "0 m";
    
  // Format percentage with + sign if positive and 1 decimal place
  const formattedPercentage = percentageIncrease
    ? `${percentageIncrease > 0 ? '+' : ''}${percentageIncrease.toFixed(1)}%`
    : "0%";
  
  const percentageColor = percentageIncrease && percentageIncrease > 0
    ? "text-mywater-blue"
    : "text-red-500";

  return (
    <div className="space-y-6">
      {/* Remove the duplicated WelcomeMessage component - it's already in the Header */}
      
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
