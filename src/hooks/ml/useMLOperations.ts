
import { useState } from "react";
import { MeasurementData } from "@/hooks/measurements/types/measurementTypes";
import { UnitData } from "@/types/analytics";
import { AnomalyDetection, MaintenancePrediction } from "@/types/ml";
import { detectAnomalies } from "@/utils/ml/anomalyDetection";
import { v4 as uuidv4 } from "uuid";
import { savePredictions, predictMaintenanceDate } from "@/utils/ml/predictiveMaintenance";

export function useMLOperations() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [predictions, setPredictions] = useState<MaintenancePrediction[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);

  // Process measurements for predictions and anomalies
  const processData = async (
    unit: UnitData, 
    measurements: any[], // Using any temporarily to fix type errors
    options = { 
      modelId: uuidv4(),
      saveToDatabase: true 
    }
  ) => {
    setIsProcessing(true);
    try {
      // Generate maintenance predictions
      const maintenancePredictions = await predictMaintenanceDate(
        unit, 
        measurements, 
        options.modelId
      );
      setPredictions(maintenancePredictions);
      
      // Detect anomalies
      const detectedAnomalies = detectAnomalies(measurements, {
        modelId: options.modelId,
        unitId: unit.id,
        unitName: unit.name || "Unknown"
      });
      setAnomalies(detectedAnomalies);
      
      // Save predictions to database if requested
      if (options.saveToDatabase && maintenancePredictions.length > 0) {
        await savePredictions(maintenancePredictions);
      }
      
      return {
        predictions: maintenancePredictions,
        anomalies: detectedAnomalies
      };
    } catch (error) {
      console.error("Error processing ML data:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processData,
    predictions,
    anomalies,
    isProcessing
  };
}
