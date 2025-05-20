
import { useEffect } from "react";
import { useMLOperations } from "@/hooks/ml/useMLOperations";
import { MLDashboardStats } from "@/components/ml/MLDashboardStats";
import { AnomaliesList } from "@/components/ml/AnomaliesList";
import { PredictionsList } from "@/components/ml/PredictionsList";
import { AdminOnly } from "@/components/shared/RoleBasedAccess";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Calendar } from "lucide-react";
import { useUnits } from "@/hooks/useUnits";

const MLDashboard = () => {
  const { initializeModel } = useMLOperations();
  const { data: units = [] } = useUnits();
  
  // Initialize model when component mounts
  useEffect(() => {
    initializeModel();
  }, [initializeModel]);
  
  return (
    <AdminOnly
      fallback={
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <h2 className="text-xl font-medium mb-2">Access Restricted</h2>
            <p className="text-gray-400">You need admin permissions to access the ML Dashboard</p>
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">ML Analytics Dashboard</h1>
          <p className="text-gray-400">
            Monitor water system anomalies and predictive maintenance forecasts
          </p>
        </div>
        
        <MLDashboardStats />
        
        <Tabs defaultValue="anomalies" className="w-full space-y-6">
          <TabsList className="bg-spotify-dark">
            <TabsTrigger value="anomalies" className="data-[state=active]:bg-mywater-blue">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Anomaly Detections
            </TabsTrigger>
            <TabsTrigger value="predictions" className="data-[state=active]:bg-mywater-blue">
              <Calendar className="h-4 w-4 mr-2" />
              Maintenance Predictions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="anomalies" className="space-y-6">
            <AnomaliesList />
          </TabsContent>
          
          <TabsContent value="predictions" className="space-y-6">
            <PredictionsList />
          </TabsContent>
        </Tabs>
      </div>
    </AdminOnly>
  );
};

export default MLDashboard;
