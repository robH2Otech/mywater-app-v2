import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { FilterStatus } from "@/components/dashboard/FilterStatus";

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <DashboardStats />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentAlerts />
        <FilterStatus />
      </div>
    </div>
  );
};

export default Dashboard;