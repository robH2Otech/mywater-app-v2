
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
  const buckets: Record<string, { measurements: any[], startVolume: number | null, endVolume: number | null }> = {};
  
  // Initialize all 24 hour buckets
  for (let offset = 23; offset >= 0; offset--) {
    const hour = new Date(now);
    hour.setHours(now.getHours() - offset, 0, 0, 0); // Reset minutes, seconds, ms
    const hourKey = hour.getHours().toString().padStart(2, '0') + ':00';
    buckets[hourKey] = { measurements: [], startVolume: null, endVolume: null };
  }

  // Place measurements in appropriate hourly buckets
  for (const measurement of sortedMeasurements) {
    if (!measurement.timestamp) continue;
    
    const timestamp = measurement.timestamp instanceof Date 
      ? measurement.timestamp 
      : new Date(measurement.timestamp);
    
    const hourKey = timestamp.getHours().toString().padStart(2, '0') + ':00';
    
    // Only process measurements within our 24h window
    if (hourKey in buckets) {
      const volume = typeof measurement.volume === "number" 
        ? measurement.volume 
        : parseFloat(measurement.volume || "0");
        
      if (!isNaN(volume)) {
        buckets[hourKey].measurements.push({
          ...measurement,
          parsedVolume: volume,
          timestamp: timestamp
        });
      }
    }
  }

  // Calculate hourly flow rates for each bucket
  const flowRates: FlowRate[] = [];

  for (const hourKey of Object.keys(buckets)) {
    const bucket = buckets[hourKey];
    let hourlyVolume = 0;
    
    // Sort measurements within the bucket by timestamp
    if (bucket.measurements.length > 0) {
      bucket.measurements.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      // Get first and last measurement in this hour
      const firstMeasurement = bucket.measurements[0];
      const lastMeasurement = bucket.measurements[bucket.measurements.length - 1];
      
      // Calculate volume difference within this hour
      if (lastMeasurement.parsedVolume >= firstMeasurement.parsedVolume) {
        hourlyVolume = lastMeasurement.parsedVolume - firstMeasurement.parsedVolume;
      } else {
        // If there's a reset or anomaly, take average of measurements
        const volumes = bucket.measurements.map(m => m.parsedVolume);
        hourlyVolume = volumes.length > 0 ? 
          volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length : 0;
      }
    }
    
    // Ensure we're not showing negative or astronomical values (likely errors)
    if (hourlyVolume < 0) hourlyVolume = 0;
    if (hourlyVolume > 1000000) hourlyVolume = 0; // Cap unreasonable values

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
