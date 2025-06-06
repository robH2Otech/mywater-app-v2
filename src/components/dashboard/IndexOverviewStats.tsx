
import { Droplets, Filter, Bell, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { formatThousands } from "@/utils/measurements/formatUtils";

interface IndexOverviewStatsProps {
  unitsCount: number;
  filtersCount: number;
  alertsCount: number;
  formattedVolume: string;
}

export const IndexOverviewStats = ({
  unitsCount,
  filtersCount,
  alertsCount,
  formattedVolume
}: IndexOverviewStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Units"
        value={unitsCount.toString()}
        icon={<Droplets />}
        link="/units"
        iconColor="text-mywater-blue"
      />
      
      <StatCard
        title="Filter Changes Required"
        value={filtersCount.toString()}
        icon={<Filter />}
        link="/filters"
        iconColor="text-yellow-500"
      />
      
      <StatCard
        title="Active Alerts"
        value={alertsCount.toString()}
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
  );
};
