
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
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [totalVolume, setTotalVolume] = useState(0);
  const [isVolumeLoading, setIsVolumeLoading] = useState(true);
  const { company, userRole } = useAuth();
  const isSuperAdmin = userRole === 'superadmin';
  
  const { data: units = [], isLoading: unitsLoading } = useUnits();
  
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
    queryKey: ["active-alerts-count", company, userRole],
    queryFn: async () => {
      const alertsCollection = collection(db, "alerts");
      let alertsQuery;
      
      if (isSuperAdmin) {
        // Superadmin sees all alerts
        alertsQuery = query(
          alertsCollection,
          where("status", "in", ["warning", "urgent"])
        );
      } else {
        // Filter by company for other roles
        alertsQuery = query(
          alertsCollection,
          where("company", "==", company || ""),
          where("status", "in", ["warning", "urgent"])
        );
      }
      
      const alertsSnapshot = await getDocs(alertsQuery);
      return alertsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        };
      });
    },
    enabled: !!userRole && !!company,
  });
  
  const { data: filtersNeedingChange = [], isLoading: filtersLoading } = useQuery({
    queryKey: ["filters-needing-change", company, userRole],
    queryFn: async () => {
      const filtersCollection = collection(db, "filters");
      let filtersQuery;
      
      if (isSuperAdmin) {
        // Superadmin sees all filters
        filtersQuery = query(
          filtersCollection,
          where("status", "in", ["warning", "critical"])
        );
      } else {
        // Filter by company for other roles
        filtersQuery = query(
          filtersCollection,
          where("company", "==", company || ""),
          where("status", "in", ["warning", "critical"])
        );
      }
      
      const filtersSnapshot = await getDocs(filtersQuery);
      return filtersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        };
      });
    },
    enabled: !!userRole && !!company,
  });
  
  const isLoading = unitsLoading || alertsLoading || filtersLoading || isVolumeLoading;
  
  const formattedVolume = totalVolume ? `${formatThousands(totalVolume)}m³` : "0m³";

  return (
    <div className="space-y-6">
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
