
import { format } from "date-fns";

export interface FlowRate {
  name: string;
  volume: number;
}

export const calculateHourlyFlowRates = (measurements: any[]): FlowRate[] => {
  if (!measurements || measurements.length < 2) return [];
  
  // Sort measurements by timestamp in ascending order
  const sortedMeasurements = [...measurements].sort((a, b) => {
    const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
    const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
    return timeA.getTime() - timeB.getTime();
  });

  // Calculate flow rates between consecutive measurements
  const flowRates = [];
  for (let i = 0; i < sortedMeasurements.length - 1; i++) {
    const current = sortedMeasurements[i];
    const next = sortedMeasurements[i + 1];
    
    const currentTime = current.timestamp instanceof Date ? current.timestamp : new Date(current.timestamp);
    const nextTime = next.timestamp instanceof Date ? next.timestamp : new Date(next.timestamp);
    
    // Get volume values, ensuring they are numbers
    const currentVolume = typeof current.volume === 'number' ? current.volume : parseFloat(current.volume || '0');
    const nextVolume = typeof next.volume === 'number' ? next.volume : parseFloat(next.volume || '0');
    
    // Alternative: If using cumulative_volume, use that instead
    const currCumulativeVolume = current.cumulative_volume !== undefined ? 
      (typeof current.cumulative_volume === 'number' ? current.cumulative_volume : parseFloat(current.cumulative_volume || '0')) : 
      currentVolume;
      
    const nextCumulativeVolume = next.cumulative_volume !== undefined ? 
      (typeof next.cumulative_volume === 'number' ? next.cumulative_volume : parseFloat(next.cumulative_volume || '0')) : 
      nextVolume;
    
    // Calculate volume difference
    const volumeDiff = nextCumulativeVolume - currCumulativeVolume;
    
    // Calculate time difference in hours
    const timeDiffMs = nextTime.getTime() - currentTime.getTime();
    const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
    
    // Calculate flow rate in m³/h
    // If time difference is too small, avoid division by near-zero
    const hourlyRate = timeDiffHours > 0.01 ? volumeDiff / timeDiffHours : 0;
    
    // Only include valid measurements with positive flow rates
    if (!isNaN(hourlyRate) && hourlyRate >= 0) {
      flowRates.push({
        name: format(currentTime, 'HH:mm'),
        volume: Number(hourlyRate.toFixed(2))  // Flow rate in m³/h
      });
    }
  }
  
  return flowRates;
};
