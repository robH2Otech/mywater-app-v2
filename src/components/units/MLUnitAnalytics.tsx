
import { Card } from "@/components/ui/card";
import { AnomaliesList } from "@/components/ml/AnomaliesList";
import { PredictionsList } from "@/components/ml/PredictionsList";
import { useMLOperations } from "@/hooks/ml/useMLOperations";
import { UnitData } from "@/types/analytics";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, RefreshCw } from "lucide-react";
import { useRealtimeMeasurements } from "@/hooks/measurements/useRealtimeMeasurements";
import { useState } from "react";
import { toast } from "sonner";

interface MLUnitAnalyticsProps {
  unit: UnitData;
}

export function MLUnitAnalytics({ unit }: MLUnitAnalyticsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { measurements } = useRealtimeMeasurements(unit.id);
  const { processUnitMeasurements, generatePredictions } = useMLOperations();
  
  const handleAnalyze = async () => {
    if (measurements.length < 10) {
      toast.error("Not enough measurement data for ML analysis");
      return;
    }
    
    setIsAnalyzing(true);
    try {
      // Process for anomalies
      const anomalies = await processUnitMeasurements(unit.id, unit.name, measurements);
      
      // Generate maintenance predictions
      const predictions = await generatePredictions(unit, measurements);
      
      // Show toast with results
      if (anomalies.length > 0 || predictions.length > 0) {
        toast.success(`Analysis complete: ${anomalies.length} anomalies and ${predictions.length} predictions generated`);
      } else {
        toast.info("Analysis complete: No anomalies or maintenance predictions detected");
      }
    } catch (error) {
      console.error("Error analyzing unit data:", error);
      toast.error("Failed to analyze unit data");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">ML Analytics</h2>
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing || measurements.length < 10}
          className="bg-mywater-blue hover:bg-blue-600"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Run ML Analysis
            </>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4 bg-spotify-darker border-spotify-accent">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-base font-medium">Detected Anomalies</h3>
          </div>
          <AnomaliesList unitId={unit.id} limit={5} />
        </Card>
        
        <Card className="p-4 bg-spotify-darker border-spotify-accent">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-mywater-blue mr-2" />
            <h3 className="text-base font-medium">Maintenance Predictions</h3>
          </div>
          <PredictionsList unitId={unit.id} limit={5} />
        </Card>
      </div>
    </div>
  );
}
