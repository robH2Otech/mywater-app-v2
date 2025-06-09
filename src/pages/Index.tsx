
import { Bell, Droplets, Filter, TrendingUp } from "lucide-react";
import { useUnits } from "@/hooks/useUnits";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { StatCard } from "@/components/dashboard/StatCard";
import { WaterUsageChart } from "@/components/dashboard/WaterUsageChart";
import { formatThousands } from "@/utils/measurements/formatUtils";
import { useEffect, useState } from "react";
import { fetchUnitTotalVolumes } from "@/utils/measurements/unitVolumeUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

const Index = () => {
  const { userRole, company } = useAuth();
  const [totalVolume, setTotalVolume] = useState(0);
  const [isVolumeLoading, setIsVolumeLoading] = useState(true);
  
  const { data: units = [], isLoading: unitsLoading } = useUnits();
  
  console.log("Dashboard - User role:", userRole, "Company:", company, "Units count:", units.length);
  
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
  
  const { data: activeAlerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["active-alerts-count", userRole],
    queryFn: async () => {
      console.log("Fetching alerts for role:", userRole);
      
      const alertsQuery = query(
        collection(db, "alerts"),
        where("status", "in", ["warning", "urgent"])
      );
      
      const alertsSnapshot = await getDocs(alertsQuery);
      const alerts = alertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Fetched ${alerts.length} alerts`);
      return alerts;
    },
    enabled: !!userRole,
  });
  
  const { data: filtersNeedingChange = [], isLoading: filtersLoading } = useQuery({
    queryKey: ["filters-needing-change", userRole],
    queryFn: async () => {
      console.log("Fetching filters for role:", userRole);
      
      const filtersQuery = query(
        collection(db, "filters"),
        where("status", "in", ["warning", "critical"])
      );
      
      const filtersSnapshot = await getDocs(filtersQuery);
      const filters = filtersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Fetched ${filters.length} filters needing change`);
      return filters;
    },
    enabled: !!userRole,
  });
  
  const isLoading = unitsLoading || alertsLoading || filtersLoading || isVolumeLoading;
  
  const formattedVolume = totalVolume ? `${formatThousands(totalVolume)}m³` : "0m³";

  return (
    <div className="space-y-6">
      {userRole === 'superadmin' && (
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
          <p className="text-green-300 text-sm">
            ✅ Superadmin Access: Viewing data from ALL companies ({units.length} total units)
          </p>
        </div>
      )}
      
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
          value={filtersNeedingChange.length.toString()}
          icon={<Filter />}
          link="/filters"
          iconColor="text-yellow-500"
        />
        
        <StatCard
          title="Active Alerts"
          value={activeAlerts.length.toString()}
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
