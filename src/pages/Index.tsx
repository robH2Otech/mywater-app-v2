
import { WaterUsageChart } from "@/components/dashboard/WaterUsageChart";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { IndexOverviewStats } from "@/components/dashboard/IndexOverviewStats";
import { IndexLoadingState } from "@/components/dashboard/IndexLoadingState";
import { IndexErrorState } from "@/components/dashboard/IndexErrorState";
import { TechnicianDashboard } from "@/components/dashboard/TechnicianDashboard";
import { useRefactoredIndexPageData } from "@/hooks/dashboard/useRefactoredIndexPageData";

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
  } = useRefactoredIndexPageData();

  // Show loading state
  if (isLoading) {
    return <IndexLoadingState />;
  }

  // Show error state only if critical error
  if (hasError) {
    return <IndexErrorState company={company} userRole={userRole} />;
  }

  // Show simplified dashboard for technicians
  if (userRole === 'technician') {
    return (
      <TechnicianDashboard
        unitsCount={units.length}
        filtersCount={filtersNeedingChange.length}
        alertsCount={activeAlerts.length}
        formattedVolume={formattedVolume}
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
        formattedVolume={formattedVolume}
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
