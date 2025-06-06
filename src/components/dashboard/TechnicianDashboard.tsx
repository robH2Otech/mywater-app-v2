
import { Card } from "@/components/ui/card";
import { Wrench, AlertTriangle, Filter, Activity, CheckCircle } from "lucide-react";
import { IndexOverviewStats } from "./IndexOverviewStats";
import { WaterUsageChart } from "./WaterUsageChart";
import { RecentAlerts } from "./RecentAlerts";

interface TechnicianDashboardProps {
  unitsCount: number;
  filtersCount: number;
  alertsCount: number;
  formattedVolume: string;
  units: any[];
}

export const TechnicianDashboard = ({
  unitsCount,
  filtersCount,
  alertsCount,
  formattedVolume,
  units
}: TechnicianDashboardProps) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Success Message */}
      <Card className="p-4 bg-green-900/20 border-green-800">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <div>
            <h2 className="text-lg font-semibold text-white">Technician Dashboard</h2>
            <p className="text-green-300 text-sm">
              Successfully loaded {unitsCount} units for monitoring and maintenance
            </p>
          </div>
        </div>
      </Card>

      {/* Overview Statistics */}
      <IndexOverviewStats
        unitsCount={unitsCount}
        filtersCount={filtersCount}
        alertsCount={alertsCount}
        formattedVolume={formattedVolume}
      />
      
      {/* Quick Actions for Technicians */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 hover:bg-gray-800/50 transition-colors">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <div>
              <h3 className="font-semibold text-white">Priority Alerts</h3>
              <p className="text-sm text-gray-400">
                {alertsCount} active alert{alertsCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 hover:bg-gray-800/50 transition-colors">
          <div className="flex items-center space-x-3">
            <Filter className="h-6 w-6 text-orange-500" />
            <div>
              <h3 className="font-semibold text-white">Filter Maintenance</h3>
              <p className="text-sm text-gray-400">
                {filtersCount} filter{filtersCount !== 1 ? 's' : ''} need attention
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 hover:bg-gray-800/50 transition-colors">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-green-500" />
            <div>
              <h3 className="font-semibold text-white">System Status</h3>
              <p className="text-sm text-gray-400">
                {unitsCount} unit{unitsCount !== 1 ? 's' : ''} monitored
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts and Alerts - Only show if we have data */}
      {(units.length > 0 || alertsCount > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <WaterUsageChart units={units} />
          <RecentAlerts />
        </div>
      )}
      
      {/* Show message if no data */}
      {units.length === 0 && alertsCount === 0 && (
        <Card className="p-6 bg-blue-900/20 border-blue-800">
          <div className="text-center">
            <Wrench className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-white mb-2">No Data Available</h3>
            <p className="text-blue-300">
              No units or alerts are currently available for monitoring. 
              Contact your administrator if you believe this is an error.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
