
import { ProcessedMeasurement } from "@/hooks/measurements/types/measurementTypes";
import { AnomalyDetection, PredictionModel } from "@/types/ml";
import { calculateMovingAverage, detectAnomalies, calculateStandardDeviation, applyExponentialSmoothing } from "./statisticalAnalysis";
import { formatTimestamp } from "@/utils/measurements/formatUtils";

/**
 * Process measurements to detect anomalies
 * @param measurements Array of processed measurements
 * @param model Prediction model configuration
 * @param unitId Unit ID
 * @param unitName Unit name
 * @returns Array of detected anomalies
 */
export const processAnomalies = (
  measurements: ProcessedMeasurement[], 
  model: PredictionModel,
  unitId: string,
  unitName: string
): AnomalyDetection[] => {
  if (measurements.length < model.configParams.movingAverageWindow) {
    console.log(`Not enough data for unit ${unitId} to detect anomalies`);
    return [];
  }

  const detectedAnomalies: AnomalyDetection[] = [];
  const now = new Date();
  
  // Process flow rate anomalies
  const volumes = measurements.map(m => m.volume);
  const smoothedVolumes = applyExponentialSmoothing(volumes, model.configParams.smoothingFactor);
  const volumeMovingAvgs = calculateMovingAverage(smoothedVolumes, model.configParams.movingAverageWindow);
  const volumeAnomalyIndices = detectAnomalies(
    smoothedVolumes, 
    volumeMovingAvgs, 
    model.configParams.standardDeviationThreshold
  );
  
  // Create flow rate anomalies
  volumeAnomalyIndices.forEach(index => {
    const measurement = measurements[index];
    const expectedValue = volumeMovingAvgs[index];
    const deviation = Math.abs(measurement.volume - expectedValue);
    const deviationPercentage = (deviation / expectedValue) * 100;
    
    // Only add significant anomalies (over 20% deviation)
    if (deviationPercentage > 20) {
      detectedAnomalies.push({
        id: `anomaly-${unitId}-flow-${Date.now()}-${index}`,
        unitId,
        unitName,
        detectionDate: formatTimestamp(now),
        type: "flow_rate",
        severity: deviationPercentage > 50 ? "high" : deviationPercentage > 30 ? "medium" : "low",
        value: measurement.volume,
        expectedValue,
        deviationPercentage,
        confidence: Math.max(60, 100 - (10 / model.configParams.movingAverageWindow)),
        status: "new",
        modelId: model.id
      });
    }
  });
  
  // Process temperature anomalies if available
  if (measurements[0].temperature !== undefined) {
    const temperatures = measurements.map(m => m.temperature);
    const smoothedTemps = applyExponentialSmoothing(temperatures, model.configParams.smoothingFactor);
    const tempMovingAvgs = calculateMovingAverage(smoothedTemps, model.configParams.movingAverageWindow);
    const tempAnomalyIndices = detectAnomalies(
      smoothedTemps, 
      tempMovingAvgs, 
      model.configParams.standardDeviationThreshold
    );
    
    tempAnomalyIndices.forEach(index => {
      const measurement = measurements[index];
      const expectedValue = tempMovingAvgs[index];
      const deviation = Math.abs(measurement.temperature - expectedValue);
      const deviationPercentage = (deviation / expectedValue) * 100;
      
      // Only add significant temperature anomalies (over 15% deviation)
      if (deviationPercentage > 15) {
        detectedAnomalies.push({
          id: `anomaly-${unitId}-temp-${Date.now()}-${index}`,
          unitId,
          unitName,
          detectionDate: formatTimestamp(now),
          type: "temperature",
          severity: deviationPercentage > 40 ? "high" : deviationPercentage > 25 ? "medium" : "low",
          value: measurement.temperature,
          expectedValue,
          deviationPercentage,
          confidence: Math.max(60, 100 - (10 / model.configParams.movingAverageWindow)),
          status: "new",
          modelId: model.id
        });
      }
    });
  }
  
  return detectedAnomalies;
};

/**
 * Score anomaly severity based on measurements and expected values
 * @param anomaly Anomaly detection object
 * @returns Updated anomaly with refined severity and confidence
 */
export const scoreAnomaly = (anomaly: AnomalyDetection): AnomalyDetection => {
  // Adjust severity based on type-specific criteria
  let adjustedSeverity = anomaly.severity;
  
  // For flow rate anomalies, high deviations in UVC units are more critical
  if (anomaly.type === "flow_rate" && anomaly.unitId.includes("MYWATER_") && anomaly.deviationPercentage > 60) {
    adjustedSeverity = "high";
  }
  
  // For temperature anomalies, if below expected, less severe than if above expected
  if (anomaly.type === "temperature") {
    if (anomaly.value < anomaly.expectedValue && anomaly.severity === "high") {
      adjustedSeverity = "medium";
    } else if (anomaly.value > anomaly.expectedValue && anomaly.severity === "medium") {
      adjustedSeverity = "high";  // Higher temperatures more concerning
    }
  }
  
  return {
    ...anomaly,
    severity: adjustedSeverity
  };
};
