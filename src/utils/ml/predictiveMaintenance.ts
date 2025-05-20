
import { UnitData } from "@/types/analytics";
import { MaintenancePrediction, PredictionModel } from "@/types/ml";
import { ProcessedMeasurement } from "@/hooks/measurements/types/measurementTypes";
import { linearRegression, calculateConfidenceLevel } from "./statisticalAnalysis";
import { determineUnitStatus } from "@/utils/unitStatusUtils";
import { determineUVCStatus } from "@/utils/uvcStatusUtils";

// Constants for maintenance thresholds
const FILTER_WARNING_THRESHOLD = 9500;
const FILTER_URGENT_THRESHOLD = 9900;
const UVC_WARNING_THRESHOLD = 8500;
const UVC_URGENT_THRESHOLD = 9500;

/**
 * Predict maintenance requirements for a unit
 * @param unit Unit data
 * @param measurements Recent measurements for the unit
 * @param model Prediction model configuration
 * @returns Maintenance predictions
 */
export const predictMaintenance = (
  unit: UnitData,
  measurements: ProcessedMeasurement[],
  model: PredictionModel
): MaintenancePrediction[] => {
  const predictions: MaintenancePrediction[] = [];
  const predictionDays = model.configParams.predictionDays || 30;
  
  if (measurements.length < 14) {
    // Need at least 14 data points for reasonable predictions
    return [];
  }
  
  // 1. Predict filter change based on volume usage trend
  if (unit.total_volume !== undefined) {
    const prediction = predictFilterChange(unit, measurements, predictionDays);
    if (prediction) predictions.push(prediction);
  }
  
  // 2. Predict UVC replacement based on hours trend
  if (unit.uvc_hours !== undefined && unit.uvc_hours > 0) {
    const prediction = predictUVCReplacement(unit, measurements, predictionDays);
    if (prediction) predictions.push(prediction);
  }
  
  // 3. Predict general service based on combination of factors
  const generalServicePrediction = predictGeneralService(unit, measurements, predictionDays);
  if (generalServicePrediction) predictions.push(generalServicePrediction);
  
  return predictions;
};

/**
 * Predict filter change requirement based on volume usage trend
 */
const predictFilterChange = (
  unit: UnitData,
  measurements: ProcessedMeasurement[],
  predictionDays: number
): MaintenancePrediction | null => {
  // Extract volumes and calculate daily usage rate
  const volumeMeasurements = measurements
    .filter(m => m.volume !== undefined && m.volume > 0)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  if (volumeMeasurements.length < 7) return null; // Need at least a week of data
  
  // Create x values as day indices (0, 1, 2, ...)
  const firstTimestamp = new Date(volumeMeasurements[0].timestamp).getTime();
  const xValues = volumeMeasurements.map(m => 
    (new Date(m.timestamp).getTime() - firstTimestamp) / (1000 * 60 * 60 * 24)
  );
  
  // Create y values as cumulative volumes
  const yValues = volumeMeasurements.map(m => m.volume);
  
  try {
    // Calculate linear regression to predict daily usage rate
    const regression = linearRegression(xValues, yValues);
    
    // Current volume from unit data
    const currentVolume = unit.total_volume || 0;
    
    // Calculate volume to filter threshold
    const volumeToWarningThreshold = FILTER_WARNING_THRESHOLD - currentVolume;
    const volumeToUrgentThreshold = FILTER_URGENT_THRESHOLD - currentVolume;
    
    // Calculate days to threshold based on daily rate (slope)
    const dailyRate = regression.slope;
    
    // If daily rate is too small or negative, can't make reliable prediction
    if (dailyRate < 1) return null;
    
    const daysToWarning = volumeToWarningThreshold / dailyRate;
    const daysToUrgent = volumeToUrgentThreshold / dailyRate;
    
    const daysRemaining = Math.min(daysToWarning, predictionDays);
    
    // Only create prediction if within prediction window
    if (daysRemaining <= predictionDays) {
      const predictedDate = new Date();
      predictedDate.setDate(predictedDate.getDate() + Math.round(daysRemaining));
      
      // Calculate priority based on days remaining
      const priority = 
        daysRemaining < 7 ? "high" : 
        daysRemaining < 14 ? "medium" : "low";
      
      // Calculate confidence based on data quality
      const confidence = calculateConfidenceLevel(
        Math.abs(dailyRate) * 0.1, 
        volumeMeasurements.length
      );
      
      return {
        id: `prediction-filter-${unit.id}-${Date.now()}`,
        unitId: unit.id,
        unitName: unit.name,
        predictedDate: predictedDate.toISOString(),
        maintenanceType: "filter_change",
        confidence,
        priority,
        status: "predicted",
        estimatedDaysRemaining: Math.round(daysRemaining),
        modelId: "default-predictive-model"
      };
    }
  } catch (error) {
    console.error("Error predicting filter change:", error);
  }
  
  return null;
};

/**
 * Predict UVC replacement requirement based on UVC hours trend
 */
const predictUVCReplacement = (
  unit: UnitData,
  measurements: ProcessedMeasurement[],
  predictionDays: number
): MaintenancePrediction | null => {
  // Check if this unit has UVC data
  const uvcMeasurements = measurements
    .filter(m => m.uvc_hours !== undefined && m.uvc_hours > 0)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  if (uvcMeasurements.length < 7) return null; // Need at least a week of data
  
  // Create x values as day indices
  const firstTimestamp = new Date(uvcMeasurements[0].timestamp).getTime();
  const xValues = uvcMeasurements.map(m => 
    (new Date(m.timestamp).getTime() - firstTimestamp) / (1000 * 60 * 60 * 24)
  );
  
  // Create y values as UVC hours
  const yValues = uvcMeasurements.map(m => m.uvc_hours || 0);
  
  try {
    // Calculate linear regression to predict daily UVC hour accumulation
    const regression = linearRegression(xValues, yValues);
    
    // Current UVC hours from unit data
    const currentUvcHours = unit.uvc_hours || 0;
    
    // Calculate hours to threshold
    const hoursToWarningThreshold = UVC_WARNING_THRESHOLD - currentUvcHours;
    const hoursToUrgentThreshold = UVC_URGENT_THRESHOLD - currentUvcHours;
    
    // Calculate days to threshold based on daily hour accumulation rate
    const dailyAccumulationRate = regression.slope;
    
    // If daily rate is too small or negative, can't make reliable prediction
    if (dailyAccumulationRate < 1) return null;
    
    const daysToWarning = hoursToWarningThreshold / dailyAccumulationRate;
    const daysToUrgent = hoursToUrgentThreshold / dailyAccumulationRate;
    
    const daysRemaining = Math.min(daysToWarning, predictionDays);
    
    // Only create prediction if within prediction window
    if (daysRemaining <= predictionDays) {
      const predictedDate = new Date();
      predictedDate.setDate(predictedDate.getDate() + Math.round(daysRemaining));
      
      // Calculate priority based on days remaining
      const priority = 
        daysRemaining < 5 ? "high" : 
        daysRemaining < 10 ? "medium" : "low";
      
      // Calculate confidence
      const confidence = calculateConfidenceLevel(
        Math.abs(dailyAccumulationRate) * 0.2, 
        uvcMeasurements.length
      );
      
      return {
        id: `prediction-uvc-${unit.id}-${Date.now()}`,
        unitId: unit.id,
        unitName: unit.name,
        predictedDate: predictedDate.toISOString(),
        maintenanceType: "uvc_replacement",
        confidence,
        priority,
        status: "predicted",
        estimatedDaysRemaining: Math.round(daysRemaining),
        modelId: "default-predictive-model"
      };
    }
  } catch (error) {
    console.error("Error predicting UVC replacement:", error);
  }
  
  return null;
};

/**
 * Predict general service requirement based on multiple factors
 */
const predictGeneralService = (
  unit: UnitData,
  measurements: ProcessedMeasurement[],
  predictionDays: number
): MaintenancePrediction | null => {
  // For general service, use combination of factors
  // - Time since last maintenance
  // - Anomaly frequency
  // - Average temperature
  
  // Simplified implementation: schedule general service every 90 days
  const setupDate = unit.setup_date ? new Date(unit.setup_date) : new Date();
  const daysSinceSetup = (new Date().getTime() - setupDate.getTime()) / (1000 * 60 * 60 * 24);
  
  const nextServiceDate = new Date(setupDate);
  nextServiceDate.setDate(setupDate.getDate() + 90); // 90 day service interval
  
  const daysToNextService = (nextServiceDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
  
  // Only predict if service is needed within prediction window
  if (daysToNextService <= predictionDays && daysToNextService > 0) {
    return {
      id: `prediction-service-${unit.id}-${Date.now()}`,
      unitId: unit.id,
      unitName: unit.name,
      predictedDate: nextServiceDate.toISOString(),
      maintenanceType: "general_service",
      confidence: 80, // High confidence for time-based prediction
      priority: daysToNextService < 7 ? "high" : daysToNextService < 14 ? "medium" : "low",
      status: "predicted",
      estimatedDaysRemaining: Math.round(daysToNextService),
      modelId: "default-predictive-model"
    };
  }
  
  return null;
};
