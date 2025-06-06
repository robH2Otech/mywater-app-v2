
import { UnitData } from "@/types/analytics";
import { WaterUsageChart } from "./WaterUsageChart";
import { RecentAlerts } from "./RecentAlerts";

interface DashboardChartsProps {
  units: UnitData[];
}

export const DashboardCharts = ({ units }: DashboardChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <WaterUsageChart units={units} />
      <RecentAlerts />
    </div>
  );
};
