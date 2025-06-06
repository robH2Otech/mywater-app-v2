
import { WaterUsageChart } from "@/components/dashboard/WaterUsageChart";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { IndexOverviewStats } from "@/components/dashboard/IndexOverviewStats";
import { IndexLoadingState } from "@/components/dashboard/IndexLoadingState";
import { IndexErrorState } from "@/components/dashboard/IndexErrorState";
import { TechnicianDashboard } from "@/components/dashboard/TechnicianDashboard";
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

  // Show simplified dashboard for technicians
  if (userRole === 'technician') {
    return (
      <TechnicianDashboard
        unitsCount={units.length}
        filtersCount={filtersNeedingChange.length}
        alertsCount={activeAlerts.length}
        formattedVolume={displayVolume}
        units={units}
      />
    );
  }

  // Standard dashboard for other roles
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
