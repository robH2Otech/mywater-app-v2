
import { WaterUsageChart } from "@/components/dashboard/WaterUsageChart";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { IndexOverviewStats } from "@/components/dashboard/IndexOverviewStats";
import { IndexLoadingState } from "@/components/dashboard/IndexLoadingState";
import { IndexErrorState } from "@/components/dashboard/IndexErrorState";
import { useIndexPageData } from "@/hooks/dashboard/useIndexPageData";
import { formatThousands } from "@/utils/measurements/formatUtils";

const Index = () => {
  const {
    units,
    activeAlerts,
    filtersNeedingChange,
    formattedVolume,
    isLoading,
    hasError,
    company,
    userRole,
  } = useIndexPageData();

  // Show loading state
  if (isLoading) {
    return <IndexLoadingState />;
  }

  // Show error state
  if (hasError) {
    return <IndexErrorState company={company} userRole={userRole} />;
  }

  // Format volume for display
  const displayVolume = formattedVolume ? formattedVolume : formatThousands(0) + "m³";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Statistics */}
      <IndexOverviewStats
        unitsCount={units.length}
        filtersCount={filtersNeedingChange.length}
        alertsCount={activeAlerts.length}
        formattedVolume={displayVolume}
      />
      
      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WaterUsageChart units={units} />
        <RecentAlerts />
      </div>
    </div>
  );
};

export default Index;
