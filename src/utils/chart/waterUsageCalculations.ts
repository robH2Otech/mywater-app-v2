
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
    
    const currentVolume = typeof current.volume === 'number' ? current.volume : parseFloat(current.volume);
    const nextVolume = typeof next.volume === 'number' ? next.volume : parseFloat(next.volume);
    
    const volumeDiff = nextVolume - currentVolume;
    const currentTime = current.timestamp instanceof Date ? current.timestamp : new Date(current.timestamp);
    
    flowRates.push({
      name: format(currentTime, 'HH:mm'),
      volume: Number(volumeDiff.toFixed(2))
    });
  }
  
  return flowRates;
};
