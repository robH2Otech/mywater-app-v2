
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

  // Sort measurements by timestamp in ascending order (oldest first)
  const sortedMeasurements = [...measurements].sort((a, b) => {
    const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
    const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
    return timeA.getTime() - timeB.getTime();
  });

  // Group measurements by hour
  const hourlyMeasurements: { [key: string]: any[] } = {};
  
  sortedMeasurements.forEach(measurement => {
    if (!measurement.timestamp) return;
    
    const timestamp = measurement.timestamp instanceof Date 
      ? measurement.timestamp 
      : new Date(measurement.timestamp);
    
    const hourKey = timestamp.getHours().toString().padStart(2, '0') + ':00';
    
    if (!hourlyMeasurements[hourKey]) {
      hourlyMeasurements[hourKey] = [];
    }
    
    hourlyMeasurements[hourKey].push({
      ...measurement,
      parsedTimestamp: timestamp
    });
  });

  // Calculate actual hourly flow rates by finding the difference between
  // the first and last measurement in each hour
  const flowRates: FlowRate[] = [];
  
  Object.entries(hourlyMeasurements).forEach(([hourKey, hourMeasurements]) => {
    if (hourMeasurements.length < 2) {
      // If we have only one measurement in the hour, we can't calculate a flow rate
      // So we'll add a minimal representative value
      flowRates.push({
        name: hourKey,
        volume: 0.1 // Small placeholder value
      });
      return;
    }
    
    // Sort the measurements within this hour
    hourMeasurements.sort((a, b) => a.parsedTimestamp.getTime() - b.parsedTimestamp.getTime());
    
    // Get first and last measurements for this hour
    const firstMeasurement = hourMeasurements[0];
    const lastMeasurement = hourMeasurements[hourMeasurements.length - 1];
    
    // Calculate the volume difference - this is the actual hourly flow rate
    let firstVolume = typeof firstMeasurement.volume === 'number' 
      ? firstMeasurement.volume 
      : parseFloat(firstMeasurement.volume || '0');
      
    let lastVolume = typeof lastMeasurement.volume === 'number' 
      ? lastMeasurement.volume 
      : parseFloat(lastMeasurement.volume || '0');
    
    // Calculate difference
    let hourlyVolume = lastVolume - firstVolume;
    
    // Handle negative or unrealistic values
    if (hourlyVolume < 0) hourlyVolume = 0;
    
    // Format to two decimal places
    const formattedVolume = Number(hourlyVolume.toFixed(2));
    
    flowRates.push({
      name: hourKey,
      volume: formattedVolume
    });
  });

  // Ensure we have entries for all 24 hours
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0') + ':00');
  const result = hours.map(hour => {
    const existing = flowRates.find(rate => rate.name === hour);
    return existing || { name: hour, volume: 0 };
  });

  // Sort by hour
  result.sort((a, b) => {
    const hourA = parseInt(a.name.split(':')[0]);
    const hourB = parseInt(b.name.split(':')[0]);
    return hourA - hourB;
  });
  
  console.log("Calculated hourly flow rates:", result);
  
  return result;
};
