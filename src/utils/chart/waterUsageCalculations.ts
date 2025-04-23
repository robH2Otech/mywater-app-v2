
import { format } from "date-fns";

export interface FlowRate {
  name: string;
  volume: number;
}

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

  console.log("Sorted measurements:", sortedMeasurements.length);

  // Determine if measurements are from a filter unit (DROP or office)
  const isFilter = measurements.some(m => {
    return m.unit_type === 'drop' || m.unit_type === 'office';
  });
  
  // Create hourly buckets to store measurements by hour
  const hourlyBuckets: Record<string, any[]> = {};
  
  // Group measurements by hour
  for (const measurement of sortedMeasurements) {
    if (!measurement.timestamp) continue;
    
    const timestamp = measurement.timestamp instanceof Date 
      ? measurement.timestamp 
      : new Date(measurement.timestamp);
    
    // Format hour key as HH:00
    const hourKey = `${timestamp.getHours().toString().padStart(2, '0')}:00`;
    
    if (!hourlyBuckets[hourKey]) {
      hourlyBuckets[hourKey] = [];
    }
    
    hourlyBuckets[hourKey].push(measurement);
  }
  
  // Calculate flow rates for each hour
  const flowRates: FlowRate[] = [];
  
  // For each hour in a day (0-23)
  for (let hour = 0; hour < 24; hour++) {
    const hourKey = `${hour.toString().padStart(2, '0')}:00`;
    const measurements = hourlyBuckets[hourKey] || [];
    
    let hourlyFlowRate = 0;
    
    if (measurements.length > 0) {
      // Calculate the hourly flow rate based on the measurements in this hour
      let validMeasurements = 0;
      let totalVolume = 0;
      
      for (const measurement of measurements) {
        let volume = 0;
        
        if (typeof measurement.volume === 'number') {
          volume = measurement.volume;
        } else if (typeof measurement.volume === 'string' && measurement.volume.trim() !== '') {
          volume = parseFloat(measurement.volume);
        }
        
        // Only add valid volumes
        if (!isNaN(volume) && isFinite(volume)) {
          totalVolume += volume;
          validMeasurements++;
        }
      }
      
      // If we have valid measurements, calculate the average flow rate for this hour
      if (validMeasurements > 0) {
        hourlyFlowRate = Number((totalVolume / validMeasurements).toFixed(2));
      }
    }
    
    // Add the hourly flow rate to our results
    flowRates.push({
      name: hourKey,
      volume: hourlyFlowRate
    });
  }
  
  // Sort by hour to ensure correct order
  flowRates.sort((a, b) => {
    const hourA = parseInt(a.name.split(':')[0]);
    const hourB = parseInt(b.name.split(':')[0]);
    return hourA - hourB;
  });
  
  console.log("Calculated flow rates:", flowRates.length);
  return flowRates;
};
