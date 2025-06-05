
import { useQuery } from "@tanstack/react-query";
import { Droplet, Bell, Calendar, Activity } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { WaterUsageChart } from "@/components/dashboard/WaterUsageChart";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";
import { determineUnitStatus } from "@/utils/unitStatusUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatThousands } from "@/utils/measurements/formatUtils";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useDataFiltering } from "@/utils/auth/dataFiltering";

const Dashboard = () => {
  const { t } = useLanguage();
  const { userRole, company, authError, isLoading: authLoading, debugInfo } = useAuth();
  const { getCompanyFilter, isGlobalAccess } = useDataFiltering();

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
          {debugInfo && (
            <div className="bg-gray-800 p-3 rounded text-xs text-gray-400">
              <p><strong>Email:</strong> {debugInfo.email}</p>
              <p><strong>UID:</strong> {debugInfo.uid}</p>
              {debugInfo.claims && (
                <p><strong>Role:</strong> {debugInfo.claims.role || 'None'}</p>
              )}
            </div>
          )}
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

  // Show success message for successful auth
  if (userRole) {
    console.log("✅ Dashboard loading with user role:", userRole, "company:", company);
  }

  // Fetch all units data with company filtering
  const { data: units = [], isLoading: isLoadingUnits, error: unitsError } = useQuery({
    queryKey: ["dashboard-units", company, userRole],
    queryFn: async () => {
      try {
        const unitsCollection = collection(db, "units");
        let unitsQuery;
        
        if (isGlobalAccess) {
          // Superadmin sees all units
          unitsQuery = unitsCollection;
        } else {
          // Filter by company for other roles
          unitsQuery = query(unitsCollection, where("company", "==", company || ""));
        }
        
        const unitsSnapshot = await getDocs(unitsQuery);
        
        const processedUnits = unitsSnapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          
          // Ensure total_volume is a number
          let totalVolume = data.total_volume;
          if (typeof totalVolume === 'string') {
            totalVolume = parseFloat(totalVolume);
          } else if (totalVolume === undefined || totalVolume === null) {
            totalVolume = 0;
          }
          
          // Recalculate status based on current volume
          const status = determineUnitStatus(totalVolume);
          
          return {
            id: doc.id,
            ...data,
            total_volume: totalVolume,
            status: status // Override with calculated status
          } as UnitData;
        });
        
        console.log(`📊 Dashboard: Fetched ${processedUnits.length} units for company: ${company}`);
        return processedUnits;
      } catch (error) {
        console.error("Error fetching units:", error);
        throw error;
      }
    },
    enabled: !!userRole && !!company, // Only fetch when user role and company are available
  });

  // Fetch alerts data with company filtering
  const { data: alerts = [], isLoading: isLoadingAlerts, error: alertsError } = useQuery({
    queryKey: ["dashboard-alerts", company, userRole],
    queryFn: async () => {
      try {
        const alertsCollection = collection(db, "alerts");
        let alertsQuery;
        
        if (isGlobalAccess) {
          // Superadmin sees all alerts
          alertsQuery = query(
            alertsCollection,
            where("status", "in", ["warning", "urgent"])
          );
        } else {
          // Filter by company and status for other roles
          alertsQuery = query(
            alertsCollection,
            where("company", "==", company || ""),
            where("status", "in", ["warning", "urgent"])
          );
        }
        
        const alertsSnapshot = await getDocs(alertsQuery);
        
        const alertsData = alertsSnapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            ...data
          };
        });
        
        console.log(`🚨 Dashboard: Fetched ${alertsData.length} alerts for company: ${company}`);
        return alertsData;
      } catch (error) {
        console.error("Error fetching alerts:", error);
        throw error;
      }
    },
    enabled: !!userRole && !!company, // Only fetch when user role and company are available
  });

  // Show error state if data fetching failed
  if (unitsError || alertsError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="p-6 max-w-md w-full">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <h2 className="text-lg font-semibold text-white">Data Loading Error</h2>
          </div>
          <p className="text-gray-300 mb-4">
            {unitsError ? "Failed to load units data" : "Failed to load alerts data"}
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Company: {company || 'Not set'} | Role: {userRole || 'Not set'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  // Calculate based on live data from processed units
  const activeUnits = units.filter((unit) => unit.status === "active").length;
  const warningUnits = units.filter((unit) => unit.status === "warning").length;
  const errorUnits = units.filter((unit) => unit.status === "urgent").length;

  if (isLoadingUnits || isLoadingAlerts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Success indicator */}
      {userRole && (
        <Card className="p-4 bg-green-900/20 border-green-800">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="text-green-300">
              Dashboard loaded successfully as {userRole} for {company} ({units.length} units found)
            </p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("dashboard.total.units")}
          value={units.length}
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
          value={alerts.length}
          icon={<Bell />}
          link="/alerts"
          iconColor="text-red-500"
        />
        <StatCard
          title={t("dashboard.volume.today")}
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
