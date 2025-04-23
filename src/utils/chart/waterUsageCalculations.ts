
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

  // Group measurements by hour
  const hourlyData: { [hourKey: string]: { timestamps: Date[], volumes: number[] } } = {};
  
  for (const measurement of sortedMeasurements) {
    const timestamp = measurement.timestamp instanceof Date 
      ? measurement.timestamp 
      : new Date(measurement.timestamp);
    
    // Create hour key in format "HH:00"
    const hourKey = format(timestamp, "HH:00");
    
    if (!hourlyData[hourKey]) {
      hourlyData[hourKey] = { timestamps: [], volumes: [] };
    }
    
    const volume = typeof measurement.volume === 'number' 
      ? measurement.volume 
      : parseFloat(measurement.volume || '0');
    
    hourlyData[hourKey].timestamps.push(timestamp);
    hourlyData[hourKey].volumes.push(volume);
  }
  
  // Calculate average flow rate for each hour
  const flowRates: FlowRate[] = [];
  
  Object.entries(hourlyData).forEach(([hourKey, data]) => {
    if (data.volumes.length > 0) {
      const totalVolume = data.volumes.reduce((sum, vol) => sum + vol, 0);
      const avgVolume = totalVolume / data.volumes.length;
      
      flowRates.push({
        name: hourKey,
        volume: Number(avgVolume.toFixed(2))
      });
    }
  });
  
  // Sort by hour
  flowRates.sort((a, b) => {
    const hourA = parseInt(a.name.split(':')[0]);
    const hourB = parseInt(b.name.split(':')[0]);
    return hourA - hourB;
  });
  
  console.log("Calculated flow rates:", flowRates.length);
  return flowRates;
};
