
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

  // Calculate flow rates between consecutive measurements
  const flowRates = [];
  for (let i = 0; i < sortedMeasurements.length - 1; i++) {
    const current = sortedMeasurements[i];
    const next = sortedMeasurements[i + 1];
    
    const currentTime = current.timestamp instanceof Date ? current.timestamp : new Date(current.timestamp);
    const nextTime = next.timestamp instanceof Date ? next.timestamp : new Date(next.timestamp);
    
    // Calculate volumetric difference
    let volumeDiff;
    
    // If cumulative_volume exists, use that for more accurate calculations
    if (next.cumulative_volume !== undefined && current.cumulative_volume !== undefined) {
      const currentCumulativeVolume = typeof current.cumulative_volume === 'number' 
        ? current.cumulative_volume 
        : parseFloat(current.cumulative_volume || '0');
      
      const nextCumulativeVolume = typeof next.cumulative_volume === 'number' 
        ? next.cumulative_volume 
        : parseFloat(next.cumulative_volume || '0');
      
      volumeDiff = nextCumulativeVolume - currentCumulativeVolume;
    } else {
      // Fallback to individual volume measurements
      const currentVolume = typeof current.volume === 'number' 
        ? current.volume 
        : parseFloat(current.volume || '0');
      
      volumeDiff = currentVolume;
    }
    
    // Calculate time difference in hours
    const timeDiffMs = nextTime.getTime() - currentTime.getTime();
    const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
    
    // Calculate flow rate in m³/h - ensure we don't divide by very small numbers
    const hourlyRate = timeDiffHours > 0.01 ? volumeDiff / timeDiffHours : volumeDiff;
    
    // Only include valid measurements with reasonable flow rates (filter out nonsensical values)
    if (!isNaN(hourlyRate) && hourlyRate >= 0 && hourlyRate < 1000) {
      flowRates.push({
        name: format(currentTime, 'HH:mm'),
        volume: Number(hourlyRate.toFixed(2))  // Flow rate in m³/h
      });
    }
  }
  
  console.log("Calculated flow rates:", flowRates.length);
  return flowRates;
};
