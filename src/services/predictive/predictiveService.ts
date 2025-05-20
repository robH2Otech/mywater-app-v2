
import { doc, collection, query, where, orderBy, limit, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { isZScoreAnomaly, isPercentageAnomaly, isTemperatureAnomaly, predictMaintenanceDate } from "@/utils/analytics/anomalyDetection";
import { ProcessedMeasurement } from "@/hooks/measurements/types/measurementTypes";

interface AnomalyResult {
  isAnomaly: boolean;
  type: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  value: number;
  message: string;
}

interface MaintenancePrediction {
  unitId: string;
  unitName: string;
  predictedMaintenanceDate: Date | null;
  currentValue: number;
  thresholdValue: number;
  rateOfChange: number;
  daysRemaining: number | null;
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Analyze measurements for anomalies
 */
export async function detectAnomalies(unitId: string, measurements: ProcessedMeasurement[]): Promise<AnomalyResult[]> {
  if (!measurements || measurements.length < 5) {
    console.log("Not enough data for anomaly detection");
    return [];
  }

  const anomalies: AnomalyResult[] = [];
  const volumes = measurements.map(m => m.volume);
  const temperatures = measurements.map(m => m.temperature).filter(t => t !== undefined && t !== null) as number[];
  
  // Check each measurement for volume anomalies
  measurements.forEach((measurement, index) => {
    // Skip the first 3 since we need history for comparison
    if (index < 3) return;
    
    // Get recent data for local comparison (last 5 points excluding current)
    const recentVolumes = volumes.slice(Math.max(0, index - 5), index);
    
    // Z-score anomaly (compare to all historical data)
    if (isZScoreAnomaly(measurement.volume, volumes, 3.0)) {
      anomalies.push({
        isAnomaly: true,
        type: 'volume_zscore',
        severity: 'high',
        timestamp: measurement.timestamp,
        value: measurement.volume,
        message: `Unusual water volume detected (${measurement.volume.toFixed(2)}) significantly outside normal range`
      });
    }
    // Percentage change anomaly (compare to recent trend)
    else if (isPercentageAnomaly(measurement.volume, recentVolumes, 40)) {
      anomalies.push({
        isAnomaly: true,
        type: 'volume_percent',
        severity: 'medium',
        timestamp: measurement.timestamp,
        value: measurement.volume,
        message: `Sudden change in water flow detected (${measurement.volume.toFixed(2)})`
      });
    }
    
    // Temperature anomalies if available
    if (measurement.temperature !== undefined && measurement.temperature !== null) {
      if (isTemperatureAnomaly(measurement.temperature)) {
        anomalies.push({
          isAnomaly: true,
          type: 'temperature',
          severity: measurement.temperature > 40 ? 'high' : 'medium',
          timestamp: measurement.timestamp,
          value: measurement.temperature,
          message: `Abnormal temperature detected: ${measurement.temperature.toFixed(1)}°C`
        });
      }
    }
  });

  // Create alerts for anomalies
  for (const anomaly of anomalies) {
    try {
      // Only create alerts for high severity anomalies to avoid alert fatigue
      if (anomaly.severity === 'high') {
        await createAnomalyAlert(unitId, anomaly);
      }
    } catch (err) {
      console.error("Error creating anomaly alert:", err);
    }
  }
  
  return anomalies;
}

/**
 * Create alert for detected anomaly
 */
async function createAnomalyAlert(unitId: string, anomaly: AnomalyResult) {
  try {
    // Get unit name
    const unitDoc = await doc(db, "units", unitId);
    const unitSnap = await getDocs(query(collection(db, "units"), where("id", "==", unitId), limit(1)));
    const unitName = !unitSnap.empty ? unitSnap.docs[0].data().name || unitId : unitId;
    
    // Create alert
    await addDoc(collection(db, "alerts"), {
      unit_id: unitId,
      message: `[AI Detection] ${unitName}: ${anomaly.message}`,
      status: anomaly.severity === 'high' ? 'urgent' : 'warning',
      type: 'anomaly',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    console.log(`Created anomaly alert for ${unitId}: ${anomaly.message}`);
  } catch (error) {
    console.error("Failed to create anomaly alert:", error);
  }
}

/**
 * Predict maintenance dates for units
 */
export async function predictMaintenance(unitId: string, measurements: ProcessedMeasurement[]): Promise<MaintenancePrediction | null> {
  if (!measurements || measurements.length < 5) {
    console.log("Not enough data for maintenance prediction");
    return null;
  }

  try {
    // Get unit info
    const unitDoc = await doc(db, "units", unitId);
    const unitSnap = await getDocs(query(collection(db, "units"), where("id", "==", unitId), limit(1)));
    
    if (unitSnap.empty) {
      console.log("Unit not found for maintenance prediction");
      return null;
    }
    
    const unitData = unitSnap.docs[0].data();
    const unitName = unitData.name || unitId;
    const unitType = unitData.unit_type || 'uvc';
    
    // Determine threshold based on unit type
    let thresholdValue: number;
    let currentValue: number;
    
    if (unitType === 'uvc') {
      // For UVC units, predict based on UVC hours
      const uvcHours = measurements.map(m => m.uvc_hours).filter(h => h !== undefined && h !== null) as number[];
      if (uvcHours.length < 5) return null;
      
      thresholdValue = 9000; // Typical UVC lamp life hours
      currentValue = uvcHours[0]; // Assuming measurements are sorted newest first
    } else {
      // For filter units, predict based on volume
      thresholdValue = 2000; // Example threshold in liters
      currentValue = measurements[0].volume; // Assuming measurements are sorted newest first
    }
    
    // Calculate rate of change
    const measurementsForRate = measurements.map(m => ({
      timestamp: m.timestamp,
      value: unitType === 'uvc' ? (m.uvc_hours || 0) : m.volume
    }));
    
    // Convert to daily rate
    const dailyRate = calculateDailyChange(measurementsForRate);
    
    // Predict date
    const predictedDate = predictMaintenanceDate(currentValue, dailyRate, thresholdValue);
    
    // Calculate days remaining
    const daysRemaining = predictedDate ? 
      Math.ceil((predictedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
      null;
    
    // Determine confidence based on data quality
    let confidence: 'low' | 'medium' | 'high' = 'medium';
    if (measurements.length < 10) {
      confidence = 'low';
    } else if (measurements.length > 30) {
      confidence = 'high';
    }
    
    return {
      unitId,
      unitName,
      predictedMaintenanceDate: predictedDate,
      currentValue,
      thresholdValue,
      rateOfChange: dailyRate,
      daysRemaining,
      confidence
    };
  } catch (error) {
    console.error("Error predicting maintenance:", error);
    return null;
  }
}

/**
 * Calculate daily rate of change from measurements
 */
function calculateDailyChange(measurements: Array<{ timestamp: string; value: number }>): number {
  if (measurements.length < 2) return 0;
  
  // Sort by timestamp (oldest first)
  const sorted = [...measurements].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  const firstMeasurement = sorted[0];
  const lastMeasurement = sorted[sorted.length - 1];
  
  const valueDifference = lastMeasurement.value - firstMeasurement.value;
  
  // Calculate time difference in days
  const timeDiffMs = new Date(lastMeasurement.timestamp).getTime() - 
                     new Date(firstMeasurement.timestamp).getTime();
  const timeDiffDays = timeDiffMs / (1000 * 60 * 60 * 24);
  
  // Avoid division by zero
  if (timeDiffDays === 0 || timeDiffDays < 0.1) return 0;
  
  return valueDifference / timeDiffDays;
}
