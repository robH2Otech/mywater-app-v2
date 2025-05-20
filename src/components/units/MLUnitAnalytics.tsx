
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMLOperations } from "@/hooks/ml/useMLOperations";
import { UnitData } from "@/types/analytics";
import { toast } from "sonner";
import { PredictionsList } from "@/components/ml/PredictionsList";
import { AnomaliesList } from "@/components/ml/AnomaliesList";

interface MLUnitAnalyticsProps {
  unit: UnitData;
  measurements: any[]; // Will be replaced with proper type once available
}

export function MLUnitAnalytics({ unit, measurements }: MLUnitAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'predictions' | 'anomalies'>('predictions');
  const { 
    processData, 
    predictions, 
    anomalies, 
    isProcessing,
    updateAnomalyStatus
  } = useMLOperations();
  
  const handleGenerateAnalysis = async () => {
    try {
      toast.info(`Analyzing data for ${unit.name || 'unit'}...`);
      const result = await processData(unit, measurements);
      
      if (result.predictions.length > 0 || result.anomalies.length > 0) {
        toast.success(`Analysis complete. Found ${result.predictions.length} predictions and ${result.anomalies.length} anomalies.`);
      } else {
        toast.info("Analysis complete. No significant patterns detected.");
      }
    } catch (error) {
      console.error("Error generating ML analysis:", error);
      toast.error("Failed to generate analysis. Please try again.");
    }
  };

  const handleUpdateAnomalyStatus = async (id: string, status: string) => {
    try {
      await updateAnomalyStatus(id, status);
      toast.success(`Anomaly status updated to ${status}`);
    } catch (error) {
      toast.error("Failed to update anomaly status");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>ML Analytics</span>
          <Button 
            onClick={handleGenerateAnalysis} 
            disabled={isProcessing || measurements.length === 0} 
            size="sm"
          >
            {isProcessing ? "Processing..." : "Generate Analysis"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Button 
            variant={activeTab === 'predictions' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('predictions')}
          >
            Predictions
          </Button>
          <Button 
            variant={activeTab === 'anomalies' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('anomalies')}
          >
            Anomalies
          </Button>
        </div>

        <div className="mt-4">
          {activeTab === 'predictions' && (
            <div className="space-y-4">
              {predictions && predictions.length > 0 ? (
                <PredictionsList predictions={predictions} />
              ) : (
                <p className="text-muted-foreground text-center py-4">No predictions available. Generate analysis to see predictions.</p>
              )}
            </div>
          )}

          {activeTab === 'anomalies' && (
            <div className="space-y-4">
              {anomalies && anomalies.length > 0 ? (
                <AnomaliesList anomalies={anomalies} onUpdateStatus={handleUpdateAnomalyStatus} />
              ) : (
                <p className="text-muted-foreground text-center py-4">No anomalies detected. Generate analysis to detect anomalies.</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
