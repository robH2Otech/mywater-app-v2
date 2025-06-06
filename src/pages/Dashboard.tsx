
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { useDataFiltering } from "@/utils/auth/dataFiltering";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";

const Dashboard = () => {
  const { userRole, company, authError, isLoading: authLoading, debugInfo } = useAuth();
  const { isGlobalAccess } = useDataFiltering();
  
  // Use our new custom hook to fetch dashboard data
  const { 
    units, 
    alerts, 
    isLoadingUnits, 
    isLoadingAlerts, 
    unitsError, 
    alertsError,
    activeUnits,
    warningUnits,
    errorUnits,
    calculateTotalVolume
  } = useDashboardData(company, userRole, isGlobalAccess);

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

      <DashboardStats 
        unitsCount={units.length}
        warningUnits={warningUnits}
        alertsCount={alerts.length}
        totalVolume={calculateTotalVolume(units)}
      />

      <DashboardCharts units={units} />
    </div>
  );
};

export default Dashboard;
