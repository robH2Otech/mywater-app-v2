
/**
 * Simple statistical anomaly detection utilities
 */

/**
 * Detects if a value is anomalous using Z-score method
 * Z-score measures how many standard deviations a data point is from the mean
 */
export function isZScoreAnomaly(
  value: number,
  dataset: number[],
  threshold: number = 2.5
): boolean {
  if (dataset.length < 3) return false;
  
  // Calculate mean
  const mean = dataset.reduce((sum, val) => sum + val, 0) / dataset.length;
  
  // Calculate standard deviation
  const squareDiffs = dataset.map(val => Math.pow(val - mean, 2));
  const variance = squareDiffs.reduce((sum, val) => sum + val, 0) / dataset.length;
  const stdDev = Math.sqrt(variance);
  
  // Avoid division by zero
  if (stdDev === 0) return false;
  
  // Calculate z-score
  const zScore = Math.abs(value - mean) / stdDev;
  
  // Return true if z-score exceeds threshold
  return zScore > threshold;
}

/**
 * Detects anomalies based on percentage change from moving average
 */
export function isPercentageAnomaly(
  value: number,
  recentValues: number[],
  percentThreshold: number = 30
): boolean {
  if (recentValues.length < 3) return false;
  
  // Calculate moving average
  const movingAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
  
  // Avoid division by zero
  if (movingAvg === 0) return false;
  
  // Calculate percentage difference
  const percentDiff = Math.abs((value - movingAvg) / movingAvg) * 100;
  
  return percentDiff > percentThreshold;
}

/**
 * Predicts maintenance date based on current rate and threshold
 */
export function predictMaintenanceDate(
  currentValue: number,
  rateOfChange: number, // Units per day
  thresholdValue: number
): Date | null {
  // If rate is zero or negative, no prediction possible
  if (rateOfChange <= 0) return null;
  
  // Calculate days until threshold is reached
  const remainingUnits = thresholdValue - currentValue;
  const daysRemaining = remainingUnits / rateOfChange;
  
  // If already past threshold or will never reach it
  if (daysRemaining <= 0) return null;
  
  // Calculate the date
  const predictedDate = new Date();
  predictedDate.setDate(predictedDate.getDate() + Math.ceil(daysRemaining));
  
  return predictedDate;
}

/**
 * Detect anomalous temperature readings
 */
export function isTemperatureAnomaly(
  temperature: number,
  normalRange: [number, number] = [5, 35]
): boolean {
  return temperature < normalRange[0] || temperature > normalRange[1];
}

/**
 * Calculate rate of change for a measurement over time
 * Returns units per day
 */
export function calculateDailyRateOfChange(
  measurements: Array<{ timestamp: string; value: number }>
): number {
  if (measurements.length < 2) return 0;
  
  // Sort measurements by timestamp (oldest first)
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
  if (timeDiffDays === 0) return 0;
  
  return valueDifference / timeDiffDays;
}
