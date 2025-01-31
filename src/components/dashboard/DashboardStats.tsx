import { Card } from "@/components/ui/card";
import { Users, Filter, AlertTriangle } from "lucide-react";

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description?: string;
}

const StatsCard = ({ icon, title, value, description }: StatsCardProps) => (
  <Card className="p-6 h-[120px] flex flex-col justify-between hover:bg-spotify-accent transition-colors">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="text-spotify-green">{icon}</div>
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {description && <p className="text-sm text-gray-400">{description}</p>}
    </div>
  </Card>
);

export const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatsCard
        icon={<Users className="h-6 w-6" />}
        title="Total Users"
        value="23"
        description="Active this month"
      />
      <StatsCard
        icon={<Filter className="h-6 w-6" />}
        title="Active Filters"
        value="156"
        description="Last 30 days"
      />
      <StatsCard
        icon={<AlertTriangle className="h-6 w-6" />}
        title="Open Alerts"
        value="8"
        description="Requires attention"
      />
    </div>
  );
};