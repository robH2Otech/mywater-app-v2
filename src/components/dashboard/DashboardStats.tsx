
import { Droplet, Bell, Calendar, Activity } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { formatThousands } from "@/utils/measurements/formatUtils";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardStatsProps {
  unitsCount: number;
  warningUnits: number;
  alertsCount: number;
  totalVolume: number;
}

export const DashboardStats = ({ 
  unitsCount, 
  warningUnits, 
  alertsCount, 
  totalVolume 
}: DashboardStatsProps) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title={t("dashboard.total.units")}
        value={unitsCount}
        icon={<Droplet />}
        link="/units"
      />
      <StatCard
        title={t("dashboard.filter.changes")}
        value={warningUnits}
        icon={<Calendar />}
        link="/filters"
        iconColor="text-yellow-500"
      />
      <StatCard
        title={t("dashboard.active.alerts")}
        value={alertsCount}
        icon={<Bell />}
        link="/alerts"
        iconColor="text-red-500"
      />
      <StatCard
        title={t("dashboard.volume.today")}
        value={`${formatThousands(totalVolume)} m³`}
        icon={<Activity />}
        link="/analytics"
        subValue={`${unitsCount > 0 ? '↑ 13.2%' : '-'}`}
      />
    </div>
  );
};
