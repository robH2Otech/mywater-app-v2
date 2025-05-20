
import { UnitData } from "@/types/analytics";
import { MeasurementData } from "@/hooks/measurements/types/measurementTypes";
import { MaintenancePrediction } from "@/types/ml";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { v4 as uuidv4 } from "uuid";

/**
 * Predicts when maintenance will be needed based on historical data
 */
export const predictMaintenanceDate = async (
  unit: UnitData, 
  measurements: MeasurementData[],
  modelId: string
): Promise<MaintenancePrediction[]> => {
  if (measurements.length < 10) {
    console.log("Not enough measurements for accurate maintenance prediction");
    return [];
  }
  
  const predictions: MaintenancePrediction[] = [];
  
  // Sort measurements by timestamp
  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Calculate average daily volume usage
  const dailyUsageSamples: number[] = [];
  let previousDay: Date | null = null;
  let dayVolume = 0;
  
  sortedMeasurements.forEach(measurement => {
    const measurementDate = new Date(measurement.timestamp);
    const currentDay = new Date(
      measurementDate.getFullYear(),
      measurementDate.getMonth(),
      measurementDate.getDate()
    );
    
    // Convert volume to number if it's a string
    const volume = typeof measurement.volume === 'string' 
      ? parseFloat(measurement.volume) 
      : (measurement.volume || 0);
      
    if (!previousDay) {
      previousDay = currentDay;
      dayVolume = volume;
    } else if (currentDay.getTime() === previousDay.getTime()) {
      // Same day, accumulate volume
      dayVolume = Math.max(dayVolume, volume);
    } else {
      // New day, record previous day's volume
      dailyUsageSamples.push(dayVolume);
      previousDay = currentDay;
      dayVolume = volume;
    }
  });
  
  // Add the last day
  if (dayVolume > 0) {
    dailyUsageSamples.push(dayVolume);
  }
  
  // Calculate average daily usage
  const avgDailyUsage = dailyUsageSamples.length > 0 
    ? dailyUsageSamples.reduce((sum, val) => sum + val, 0) / dailyUsageSamples.length 
    : 0;
  
  // Get current volume and estimate days until filter change needed
  const currentVolume = typeof unit.total_volume === 'string' 
    ? parseFloat(unit.total_volume) 
    : (unit.total_volume || 0);
  
  // Calculate UVC replacement prediction
  if (unit.uvc_hours !== undefined) {
    const currentUvcHours = typeof unit.uvc_hours === 'string' 
      ? parseFloat(unit.uvc_hours) 
      : (unit.uvc_hours || 0);
      
    // Calculate average UVC hours per day
    const firstTimestamp = new Date(sortedMeasurements[0]?.timestamp || Date.now());
    const lastTimestamp = new Date(sortedMeasurements[sortedMeasurements.length - 1]?.timestamp || Date.now());
    const daysDiff = Math.max(1, (lastTimestamp.getTime() - firstTimestamp.getTime()) / (1000 * 60 * 60 * 24));
    
    // Default UVC replacement threshold is 9000 hours
    const uvcThreshold = 9000;
    const uvcHoursPerDay = currentUvcHours / daysDiff;
    const daysUntilUvcReplacement = uvcHoursPerDay > 0 
      ? Math.max(0, Math.round((uvcThreshold - currentUvcHours) / uvcHoursPerDay))
      : 365; // Default to a year if we can't calculate
    
    if (daysUntilUvcReplacement < 366 && daysUntilUvcReplacement > 0) {
      const predictedDate = new Date();
      predictedDate.setDate(predictedDate.getDate() + daysUntilUvcReplacement);
      
      predictions.push({
        id: uuidv4(),
        unitId: unit.id,
        unitName: unit.name || "Unknown Unit",
        predictedDate: predictedDate.toISOString(),
        maintenanceType: "uvc_replacement",
        confidence: 0.85,
        priority: daysUntilUvcReplacement < 30 ? "high" : daysUntilUvcReplacement < 90 ? "medium" : "low",
        status: "predicted",
        estimatedDaysRemaining: daysUntilUvcReplacement,
        modelId
      });
    }
  }
  
  // Calculate filter change prediction if we have usage data
  if (avgDailyUsage > 0) {
    // Default filter volume threshold is 10000 L
    const filterThreshold = 10000;
    const daysUntilFilterChange = avgDailyUsage > 0 
      ? Math.max(0, Math.round((filterThreshold - currentVolume) / avgDailyUsage)) 
      : 365; // Default to a year if we can't calculate
    
    if (daysUntilFilterChange < 366 && daysUntilFilterChange > 0) {
      const predictedDate = new Date();
      predictedDate.setDate(predictedDate.getDate() + daysUntilFilterChange);
      
      predictions.push({
        id: uuidv4(),
        unitId: unit.id,
        unitName: unit.name || "Unknown Unit",
        predictedDate: predictedDate.toISOString(),
        maintenanceType: "filter_change",
        confidence: 0.75,
        priority: daysUntilFilterChange < 30 ? "high" : daysUntilFilterChange < 90 ? "medium" : "low",
        status: "predicted",
        estimatedDaysRemaining: daysUntilFilterChange,
        modelId
      });
    }
  }
  
  // Also predict general service based on installation date
  const setupDate = unit.setup_date ? new Date(unit.setup_date) : null;
  if (setupDate) {
    const daysSinceSetup = Math.round((Date.now() - setupDate.getTime()) / (1000 * 60 * 60 * 24));
    const annualServiceDays = 365;
    const daysUntilService = Math.max(0, annualServiceDays - (daysSinceSetup % annualServiceDays));
    
    if (daysUntilService < 366) {
      const predictedDate = new Date();
      predictedDate.setDate(predictedDate.getDate() + daysUntilService);
      
      predictions.push({
        id: uuidv4(),
        unitId: unit.id,
        unitName: unit.name || "Unknown Unit",
        predictedDate: predictedDate.toISOString(),
        maintenanceType: "general_service",
        confidence: 0.9,
        priority: daysUntilService < 30 ? "high" : daysUntilService < 90 ? "medium" : "low",
        status: "predicted",
        estimatedDaysRemaining: daysUntilService,
        modelId
      });
    }
  }
  
  return predictions;
};

/**
 * Saves maintenance predictions to Firestore
 */
export const savePredictions = async (predictions: MaintenancePrediction[]): Promise<void> => {
  if (predictions.length === 0) return;
  
  const batch = [];
  for (const prediction of predictions) {
    try {
      const docRef = await addDoc(collection(db, "maintenance_predictions"), {
        ...prediction,
        createdAt: serverTimestamp()
      });
      console.log(`Prediction saved with ID: ${docRef.id}`);
      batch.push(docRef.id);
    } catch (error) {
      console.error("Error saving prediction:", error);
    }
  }
  
  console.log(`Saved ${batch.length} maintenance predictions`);
};
