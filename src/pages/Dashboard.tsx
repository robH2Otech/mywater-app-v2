
import { useQuery } from "@tanstack/react-query";
import { Droplet, Bell, Calendar, Activity } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { WaterUsageChart } from "@/components/dashboard/WaterUsageChart";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { FirebaseDebugPanel } from "@/components/debug/FirebaseDebugPanel";
import { useAllUnits, useAllAlerts, useAllFilters } from "@/hooks/useAllData";
import { UnitData } from "@/types/analytics";
import { determineUnitStatus } from "@/utils/unitStatusUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatThousands } from "@/utils/measurements/formatUtils";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { t } = useLanguage();
  const { userRole, company, authError, isLoading: authLoading, debugInfo, firebaseUser } = useAuth();

  // Use simple data fetching - NO FILTERING, NO COMPLEX LOGIC
  const { data: units = [], isLoading: unitsLoading, error: unitsError, refetch: refetchUnits } = useAllUnits();
  const { data: alerts = [], isLoading: alertsLoading, error: alertsError, refetch: refetchAlerts } = useAllAlerts();
  const { data: filters = [], isLoading: filtersLoading, error: filtersError, refetch: refetchFilters } = useAllFilters();

  console.log("🏠 Dashboard - Firebase data fetch:", {
    userRole,
    company,
    unitsCount: units.length,
    alertsCount: alerts.length,
    filtersCount: filters.length,
    debugInfo,
    firebaseUser: firebaseUser ? { uid: firebaseUser.uid, email: firebaseUser.email } : null
  });

  const handleRefreshAll = () => {
    console.log("🔄 Manually refreshing all data...");
    refetchUnits();
    refetchAlerts();
    refetchFilters();
  };

  // Show loading state while auth is being processed
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show auth error if exists
  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="p-6 max-w-md w-full">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <h2 className="text-lg font-semibold text-white">Authentication Error</h2>
          </div>
          <p className="text-gray-300 mb-4">{authError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  // Show error state if data fetching failed
  if (unitsError || alertsError || filtersError) {
    return (
      <div className="space-y-6 animate-fadeIn p-4">
        <Card className="p-6 bg-red-900/20 border-red-800">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <h2 className="text-lg font-semibold text-white">Firebase Data Loading Error</h2>
          </div>
          <p className="text-red-300 mb-4">
            Failed to load data from Firebase: {unitsError?.message || alertsError?.message || filtersError?.message}
          </p>
          <p className="text-gray-300 mb-4">
            This suggests a Firebase configuration or permission issue. Use the debug panel below to investigate.
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              Retry
            </button>
            <Button onClick={handleRefreshAll} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </Card>
        
        <FirebaseDebugPanel />
      </div>
    );
  }

  const isLoading = unitsLoading || alertsLoading || filtersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-400">Loading Firebase data...</p>
          <p className="text-gray-500 text-sm">
            User: {firebaseUser?.email} | Role: {userRole} | Company: {company}
          </p>
        </div>
      </div>
    );
  }

  // Calculate based on live data from processed units
  const activeUnits = units.filter((unit) => unit.status === "active").length;
  const warningUnits = units.filter((unit) => unit.status === "warning").length;
  const errorUnits = units.filter((unit) => unit.status === "urgent").length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Enhanced Success indicator */}
      <Card className="p-4 bg-green-900/20 border-green-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-green-300">
                ✅ FIREBASE DATA LOADED: {units.length} units, {alerts.length} alerts, {filters.length} filters 
              </p>
              <p className="text-green-400 text-sm">
                User: {firebaseUser?.email} | Role: {userRole} | Company: {company}
              </p>
            </div>
          </div>
          <Button onClick={handleRefreshAll} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Debug panel for troubleshooting */}
      {(units.length === 0 && alerts.length === 0 && filters.length === 0) && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">🔧 No Data Found - Debug Panel</h3>
          <FirebaseDebugPanel />
        </div>
      )}

      {/* Always show debug panel for testing */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">🔧 Firebase Debug Panel</h3>
        <FirebaseDebugPanel />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Units"
          value={units.length}
          icon={<Droplet />}
          link="/units"
        />
        <StatCard
          title="Filter Changes Required"
          value={warningUnits}
          icon={<Calendar />}
          link="/filters"
          iconColor="text-yellow-500"
        />
        <StatCard
          title="Active Alerts"
          value={alerts.length}
          icon={<Bell />}
          link="/alerts"
          iconColor="text-red-500"
        />
        <StatCard
          title="Total Volume Today"
          value={`${formatThousands(calculateTotalVolume(units))} m³`}
          icon={<Activity />}
          link="/analytics"
          subValue={`${units.length > 0 ? '↑ 13.2%' : '-'}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WaterUsageChart units={units} />
        <RecentAlerts />
      </div>
    </div>
  );
};

// Enhanced helper function to calculate total volume from all units
function calculateTotalVolume(units: UnitData[]): number {
  const total = units.reduce((sum, unit) => {
    // Ensure we're working with numbers
    let volume = 0;
    
    if (unit.total_volume !== undefined && unit.total_volume !== null) {
      volume = typeof unit.total_volume === 'string' 
        ? parseFloat(unit.total_volume) 
        : unit.total_volume;
    }
    
    // Skip NaN values
    if (isNaN(volume)) return sum;
    
    return sum + volume;
  }, 0);
  
  return total;
}

export default Dashboard;
