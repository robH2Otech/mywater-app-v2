
import { format } from "date-fns";

export interface FlowRate {
  name: string;
  volume: number;
}

/**
 * Calculates the hourly flow rate for each hour in the last 24 hours.
 * Each value represents the actual water used during that hour, not cumulative.
 * 
 * @param measurements - Array of measurement objects ({timestamp, volume, ...})
 * @returns Array of FlowRate objects with { name: "HH:00", volume }
 */
export const calculateHourlyFlowRates = (measurements: any[]): FlowRate[] => {
  if (!measurements || measurements.length < 2) {
    console.log("Not enough measurements to calculate flow rates", measurements);
    return [];
  }

  // Sort measurements by timestamp in ascending order
  const sortedMeasurements = [...measurements].sort((a, b) => {
    const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
    const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
    return timeA.getTime() - timeB.getTime();
  });

  // Create buckets for each hour in the last 24 hours
  const now = new Date();
  const buckets: Record<string, { measurements: any[], totalVolume: number }> = {};
  
  // Initialize all 24 hour buckets
  for (let offset = 23; offset >= 0; offset--) {
    const hour = new Date(now);
    hour.setHours(now.getHours() - offset, 0, 0, 0); // Reset minutes, seconds, ms
    const hourKey = hour.getHours().toString().padStart(2, '0') + ':00';
    buckets[hourKey] = { measurements: [], totalVolume: 0 };
  }

  // Group measurements by hour
  for (const measurement of sortedMeasurements) {
    if (!measurement.timestamp) continue;
    
    const timestamp = measurement.timestamp instanceof Date 
      ? measurement.timestamp 
      : new Date(measurement.timestamp);
    
    const hourKey = timestamp.getHours().toString().padStart(2, '0') + ':00';
    
    // Only process measurements within our 24h window
    if (hourKey in buckets) {
      buckets[hourKey].measurements.push({
        ...measurement,
        timestamp: timestamp
      });
    }
  }

  // Calculate hourly flow rates for each bucket
  const flowRates: FlowRate[] = [];

  for (const hourKey of Object.keys(buckets)) {
    const bucket = buckets[hourKey];
    let hourlyVolume = 0;
    
    if (bucket.measurements.length >= 2) {
      // Sort measurements within the hour by timestamp
      bucket.measurements.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      // Get first and last measurement in this hour
      const firstMeasurement = bucket.measurements[0];
      const lastMeasurement = bucket.measurements[bucket.measurements.length - 1];
      
      // Calculate volume difference within this hour
      const firstVolume = typeof firstMeasurement.volume === 'number' 
        ? firstMeasurement.volume 
        : parseFloat(firstMeasurement.volume || '0');
        
      const lastVolume = typeof lastMeasurement.volume === 'number' 
        ? lastMeasurement.volume 
        : parseFloat(lastMeasurement.volume || '0');
      
      // Ensure we calculate the actual usage during this hour, not the cumulative total
      hourlyVolume = lastVolume - firstVolume;
      
      // Handle negative values (could happen if meter resets)
      if (hourlyVolume < 0) hourlyVolume = 0;
      
      // Cap unreasonably large values (likely errors)
      if (hourlyVolume > 1000) hourlyVolume = 0;
    }
    
    flowRates.push({ 
      name: hourKey, 
      volume: Number(hourlyVolume.toFixed(2))
    });
  }

  // Ensure the flowRates are sorted by hour
  flowRates.sort((a, b) => {
    const hourA = parseInt(a.name.split(':')[0]);
    const hourB = parseInt(b.name.split(':')[0]);
    return hourA - hourB;
  });

  return flowRates;
};
