
import { useQuery } from "@tanstack/react-query";
import { Droplet, Bell, Calendar, Activity, Settings } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { WaterUsageChart } from "@/components/dashboard/WaterUsageChart";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { FirebaseDebugPanel } from "@/components/debug/FirebaseDebugPanel";
import { useAllUnits, useAllAlerts, useAllFilters } from "@/hooks/useAllData";
import { UnitData } from "@/types/analytics";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatThousands } from "@/utils/measurements/formatUtils";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Dashboard = () => {
  const { t } = useLanguage();
  const { userRole, company, authError, isLoading: authLoading, debugInfo, firebaseUser } = useAuth();
  const [showDebugMode, setShowDebugMode] = useState(false);

  // Use simple data fetching - NO FILTERING, NO COMPLEX LOGIC
  const { data: units = [], isLoading: unitsLoading, error: unitsError, refetch: refetchUnits } = useAllUnits();
  const { data: alerts = [], isLoading: alertsLoading, error: alertsError, refetch: refetchAlerts } = useAllAlerts();
  const { data: filters = [], isLoading: filtersLoading, error: filtersError, refetch: refetchFilters } = useAllFilters();

  console.log("🏠 Dashboard - Firebase data fetch:", {
    userRole,
    company,
    unitsCount: units.length,
    alertsCount: alerts.length,
    filtersCount: filters.length
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
          <p className="text-gray-400">{t("dashboard.loading")}</p>
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
            <h2 className="text-lg font-semibold text-white">{t("dashboard.auth.error")}</h2>
          </div>
          <p className="text-gray-300 mb-4">{authError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            {t("dashboard.retry")}
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
            <h2 className="text-lg font-semibold text-white">{t("dashboard.data.loading.error")}</h2>
          </div>
          <p className="text-red-300 mb-4">
            {t("dashboard.failed.to.load")}: {unitsError?.message || alertsError?.message || filtersError?.message}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              {t("dashboard.retry")}
            </button>
            <Button onClick={handleRefreshAll} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("dashboard.refresh.data")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isLoading = unitsLoading || alertsLoading || filtersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-400">{t("dashboard.loading.data")}</p>
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
      {/* Clean Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-green-300 text-sm">
              {t("dashboard.data.loaded")}: {units.length} {t("dashboard.units")}, {alerts.length} {t("dashboard.alerts")}, {filters.length} {t("dashboard.filters")}
            </p>
            <p className="text-gray-400 text-xs">
              {userRole === 'superadmin' ? t("dashboard.superadmin.access") : `${t("dashboard.company")}: ${company}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefreshAll} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("dashboard.refresh")}
          </Button>
          {userRole === 'superadmin' && (
            <Button 
              onClick={() => setShowDebugMode(!showDebugMode)} 
              variant="outline" 
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              {t("dashboard.debug")}
            </Button>
          )}
        </div>
      </div>

      {/* Collapsible Debug Panel - Only for Superadmin */}
      {userRole === 'superadmin' && (
        <Collapsible open={showDebugMode} onOpenChange={setShowDebugMode}>
          <CollapsibleContent>
            <div className="bg-spotify-darker border border-spotify-accent rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                {t("dashboard.debug.panel")}
              </h3>
              <FirebaseDebugPanel />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("stats.total.units")}
          value={units.length}
          icon={<Droplet />}
          link="/units"
        />
        <StatCard
          title={t("stats.filter.changes")}
          value={warningUnits}
          icon={<Calendar />}
          link="/filters"
          iconColor="text-yellow-500"
        />
        <StatCard
          title={t("stats.active.alerts")}
          value={alerts.length}
          icon={<Bell />}
          link="/alerts"
          iconColor="text-red-500"
        />
        <StatCard
          title={t("stats.volume.today")}
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
