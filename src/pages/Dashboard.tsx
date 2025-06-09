
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { useSimpleDashboard } from "@/hooks/useSimpleDashboard";

const Dashboard = () => {
  const { userRole, company, authError, isLoading: authLoading, debugInfo } = useAuth();
  
  const { 
    units, 
    activeAlerts, 
    isLoading: dataLoading, 
    hasError: dataError
  } = useSimpleDashboard();

  // Show loading state while auth is being processed
  if (authLoading || dataLoading) {
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
              <p><strong>Role:</strong> {debugInfo.role || 'None'}</p>
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

  // Show error state if data fetching failed
  if (dataError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="p-6 max-w-md w-full">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <h2 className="text-lg font-semibold text-white">Data Loading Error</h2>
          </div>
          <p className="text-gray-300 mb-4">Failed to load dashboard data</p>
          <div className="text-sm text-gray-400 mb-4">
            <p><strong>Role:</strong> {userRole || 'Not set'}</p>
            <p><strong>Company:</strong> {company || 'Not set'}</p>
            <p><strong>Is Superadmin:</strong> {userRole === 'superadmin' ? 'YES - Should see ALL data' : 'NO'}</p>
          </div>
          <div className="bg-gray-800 p-3 rounded text-xs text-gray-400 mb-4">
            <p><strong>Error Details:</strong> {dataError?.message || 'Unknown error'}</p>
          </div>
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

  const totalVolume = units.reduce((sum, unit) => {
    const volume = typeof unit.total_volume === 'string' ? parseFloat(unit.total_volume) || 0 : unit.total_volume || 0;
    return sum + volume;
  }, 0);

  const displayText = userRole === 'superadmin' 
    ? `Dashboard loaded successfully as SUPERADMIN (ALL DATA - ${units.length} units found)`
    : `Dashboard loaded successfully as ${userRole} for ${company} (${units.length} units found)`;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Success indicator */}
      {userRole && (
        <Card className="p-4 bg-green-900/20 border-green-800">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="text-green-300">{displayText}</p>
          </div>
        </Card>
      )}

      <DashboardStats 
        unitsCount={units.length}
        warningUnits={0}
        alertsCount={activeAlerts.length}
        totalVolume={totalVolume}
      />

      <DashboardCharts units={units} />
    </div>
  );
};

export default Dashboard;
