
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
  
  // Map to store hourly data with volume sums and counts
  const hourlyData: Record<string, { total: number; count: number }> = {};
  
  // Group data by hour and calculate totals
  for (let i = 0; i < sortedMeasurements.length; i++) {
    const measurement = sortedMeasurements[i];
    
    // Get timestamp for the measurement
    const timestamp = measurement.timestamp instanceof Date 
      ? measurement.timestamp 
      : new Date(measurement.timestamp);
    
    // Create hour key (format: "HH:00")
    const hour = timestamp.getHours();
    const hourKey = `${hour.toString().padStart(2, '0')}:00`;
    
    // Initialize the hourly data entry if it doesn't exist
    if (!hourlyData[hourKey]) {
      hourlyData[hourKey] = { total: 0, count: 0 };
    }
    
    // Extract volume as a number
    let volume = 0;
    if (typeof measurement.volume === 'number') {
      volume = measurement.volume;
    } else if (typeof measurement.volume === 'string' && measurement.volume.trim() !== '') {
      volume = parseFloat(measurement.volume);
    }
    
    // Skip invalid volumes
    if (isNaN(volume)) {
      continue;
    }
    
    // Add to hourly total and increment count
    hourlyData[hourKey].total += volume;
    hourlyData[hourKey].count += 1;
  }
  
  // Create hourly flow rates array from the collected data
  const flowRates: FlowRate[] = [];
  
  // Create entries for all 24 hours (even empty ones)
  for (let hour = 0; hour < 24; hour++) {
    const hourKey = `${hour.toString().padStart(2, '0')}:00`;
    const data = hourlyData[hourKey];
    
    if (data && data.count > 0) {
      flowRates.push({
        name: hourKey,
        volume: Number((data.total / data.count).toFixed(2))
      });
    } else {
      // Add empty entry
      flowRates.push({
        name: hourKey,
        volume: 0
      });
    }
  }
  
  // Sort by hour
  flowRates.sort((a, b) => {
    const hourA = parseInt(a.name.split(':')[0]);
    const hourB = parseInt(b.name.split(':')[0]);
    return hourA - hourB;
  });
  
  console.log("Calculated flow rates:", flowRates.length);
  return flowRates;
};
