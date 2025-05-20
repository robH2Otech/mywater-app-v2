
import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useMLOperations } from '@/hooks/ml/useMLOperations';
import { MLDashboardStats } from '@/components/ml/MLDashboardStats';
import { PredictionsList } from '@/components/ml/PredictionsList';
import { AnomaliesList } from '@/components/ml/AnomaliesList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MLDashboard = () => {
  const { 
    predictions, 
    anomalies, 
    isProcessing,
    processUnitMeasurements,
    updateAnomalyStatus
  } = useMLOperations();

  const handleProcessData = async () => {
    await processUnitMeasurements();
  };

  const handleUpdateAnomalyStatus = async (id: string, status: string) => {
    await updateAnomalyStatus(id, status);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <PageHeader 
        title="ML Analytics Dashboard" 
        description="Machine learning insights for your water units"
        actions={
          <button 
            className="btn btn-primary" 
            onClick={handleProcessData}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Process Data'}
          </button>
        }
      />

      <MLDashboardStats />

      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="predictions">Maintenance Predictions</TabsTrigger>
          <TabsTrigger value="anomalies">Anomaly Detections</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="mt-6">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Maintenance Predictions</h2>
            {predictions && predictions.length > 0 ? (
              <PredictionsList predictions={predictions} />
            ) : (
              <p className="text-muted-foreground text-center py-10">
                No maintenance predictions available. Process your unit data to generate predictions.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="mt-6">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Detected Anomalies</h2>
            {anomalies && anomalies.length > 0 ? (
              <AnomaliesList 
                anomalies={anomalies} 
                onUpdateStatus={handleUpdateAnomalyStatus}
              />
            ) : (
              <p className="text-muted-foreground text-center py-10">
                No anomalies detected. Process your unit data to detect anomalies.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MLDashboard;
