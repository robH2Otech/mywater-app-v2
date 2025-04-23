
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

  // Create data structure for hourly buckets
  const now = new Date();
  const hourlyData: { [hour: string]: { volumes: number[], timestamps: Date[] } } = {};
  
  // Initialize all 24 hour buckets
  for (let i = 0; i < 24; i++) {
    const hourKey = i.toString().padStart(2, '0') + ':00';
    hourlyData[hourKey] = { volumes: [], timestamps: [] };
  }

  // Group measurements by hour
  for (const measurement of sortedMeasurements) {
    if (!measurement.timestamp) continue;
    
    const timestamp = measurement.timestamp instanceof Date 
      ? measurement.timestamp 
      : new Date(measurement.timestamp);
    
    const hourKey = timestamp.getHours().toString().padStart(2, '0') + ':00';
    
    // Parse volume ensuring we have a number
    let volume = 0;
    if (measurement.volume !== undefined) {
      volume = typeof measurement.volume === 'number' 
        ? measurement.volume 
        : parseFloat(measurement.volume || '0');
    }
    
    // Only store valid measurements
    if (!isNaN(volume) && hourKey in hourlyData) {
      hourlyData[hourKey].volumes.push(volume);
      hourlyData[hourKey].timestamps.push(timestamp);
    }
  }

  // Calculate actual hourly flow rates (not cumulative)
  const flowRates: FlowRate[] = [];

  // Process each hour
  for (const hourKey of Object.keys(hourlyData)) {
    const { volumes, timestamps } = hourlyData[hourKey];
    let hourlyVolume = 0;
    
    if (volumes.length >= 2) {
      // Sort by timestamp to ensure we're calculating correctly
      const paired = timestamps.map((time, idx) => ({ time, volume: volumes[idx] }))
        .sort((a, b) => a.time.getTime() - b.time.getTime());
      
      // Get the first and last reading in this hour
      const firstReading = paired[0].volume;
      const lastReading = paired[paired.length - 1].volume;
      
      // The hourly flow rate is the difference between last and first reading
      hourlyVolume = lastReading - firstReading;
      
      // Handle negative values (could happen if meter resets)
      if (hourlyVolume < 0) hourlyVolume = 0;
      
      // Cap unreasonably large values (likely errors)
      if (hourlyVolume > 100) hourlyVolume = Math.min(hourlyVolume, 10);
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
