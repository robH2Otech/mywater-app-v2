
import { useMLOperations } from "@/hooks/ml/useMLOperations";
import { Card } from "@/components/ui/card";
import { 
  Activity, 
  AlertTriangle, 
  BarChart4, 
  Calendar, 
  Droplet, 
  Percent
} from "lucide-react";

export function MLDashboardStats() {
  const { mlStats, isLoading } = useMLOperations();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <Card key={index} className="p-6 bg-spotify-darker border-spotify-accent animate-pulse">
            <div className="h-20"></div>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="p-6 bg-spotify-darker border-spotify-accent">
        <div className="flex items-center">
          <div className="bg-blue-900/50 p-3 rounded-full">
            <AlertTriangle className="h-6 w-6 text-mywater-blue" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-400">Active Anomalies</p>
            <h3 className="text-2xl font-semibold text-white">{mlStats?.activeAnomalies || 0}</h3>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          Out of {mlStats?.totalAnomaliesDetected || 0} total anomalies detected
        </div>
      </Card>
      
      <Card className="p-6 bg-spotify-darker border-spotify-accent">
        <div className="flex items-center">
          <div className="bg-yellow-900/50 p-3 rounded-full">
            <Calendar className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-400">Predicted Maintenance</p>
            <h3 className="text-2xl font-semibold text-white">{mlStats?.predictedMaintenanceTasks || 0}</h3>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          {mlStats?.upcomingMaintenanceTasks || 0} high priority tasks in the next 14 days
        </div>
      </Card>
      
      <Card className="p-6 bg-spotify-darker border-spotify-accent">
        <div className="flex items-center">
          <div className="bg-green-900/50 p-3 rounded-full">
            <Percent className="h-6 w-6 text-green-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-400">Model Accuracy</p>
            <h3 className="text-2xl font-semibold text-white">{mlStats?.averageModelAccuracy || 0}%</h3>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          Based on validation against known outcomes
        </div>
      </Card>
      
      <Card className="p-6 bg-spotify-darker border-spotify-accent">
        <div className="flex items-center">
          <div className="bg-purple-900/50 p-3 rounded-full">
            <Activity className="h-6 w-6 text-purple-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-400">Anomaly Detection Rate</p>
            <h3 className="text-2xl font-semibold text-white">
              {mlStats && mlStats.monitoredUnits > 0 
                ? (mlStats.totalAnomaliesDetected / mlStats.monitoredUnits).toFixed(1) 
                : "0"}
            </h3>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          Average anomalies per monitored unit
        </div>
      </Card>
      
      <Card className="p-6 bg-spotify-darker border-spotify-accent">
        <div className="flex items-center">
          <div className="bg-cyan-900/50 p-3 rounded-full">
            <Droplet className="h-6 w-6 text-cyan-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-400">Monitored Units</p>
            <h3 className="text-2xl font-semibold text-white">{mlStats?.monitoredUnits || 0}</h3>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          Units with enough data for prediction
        </div>
      </Card>
      
      <Card className="p-6 bg-spotify-darker border-spotify-accent">
        <div className="flex items-center">
          <div className="bg-orange-900/50 p-3 rounded-full">
            <BarChart4 className="h-6 w-6 text-orange-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-400">Prediction Horizon</p>
            <h3 className="text-2xl font-semibold text-white">30 Days</h3>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          Maintenance predicted up to 30 days in advance
        </div>
      </Card>
    </div>
  );
}
