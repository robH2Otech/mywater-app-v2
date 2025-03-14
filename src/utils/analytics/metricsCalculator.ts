
import { format } from "date-fns";

/**
 * Calculate aggregated metrics from measurements
 */
export const calculateMetricsFromMeasurements = (measurements: any[]) => {
  if (!measurements.length) {
    return {
      totalVolume: 0,
      avgVolume: 0,
      maxVolume: 0,
      avgTemperature: 0,
      totalUvcHours: 0,
      dailyData: []
    };
  }
  
  let totalVolume = 0;
  let totalTemperature = 0;
  let maxVolume = 0;
  let totalUvcHours = 0;
  
  // Create daily aggregations for charts
  const dailyMap = new Map();
  
  measurements.forEach(measurement => {
    const volume = typeof measurement.volume === 'number' ? measurement.volume : 0;
    const temperature = typeof measurement.temperature === 'number' ? measurement.temperature : 0;
    const uvcHours = typeof measurement.uvc_hours === 'number' ? measurement.uvc_hours : 0;
    
    totalVolume += volume;
    totalTemperature += temperature;
    totalUvcHours += uvcHours;
    
    if (volume > maxVolume) {
      maxVolume = volume;
    }
    
    // Group by day for chart data
    if (measurement.timestamp) {
      const day = typeof measurement.timestamp === 'string' 
        ? measurement.timestamp.split('T')[0] 
        : format(measurement.timestamp, 'yyyy-MM-dd');
        
      if (!dailyMap.has(day)) {
        dailyMap.set(day, { 
          date: day, 
          volume: 0, 
          temperature: 0,
          uvcHours: 0,
          count: 0 
        });
      }
      
      const dayData = dailyMap.get(day);
      dayData.volume += volume;
      dayData.temperature += temperature;
      dayData.uvcHours += uvcHours;
      dayData.count += 1;
    }
  });
  
  // Calculate averages for each day
  const dailyData = Array.from(dailyMap.values()).map(day => ({
    date: day.date,
    volume: day.volume,
    avgVolume: day.volume / day.count,
    avgTemperature: day.temperature / day.count,
    uvcHours: day.uvcHours
  }));
  
  // Sort by date
  dailyData.sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    totalVolume,
    avgVolume: totalVolume / measurements.length,
    maxVolume,
    avgTemperature: totalTemperature / measurements.length,
    totalUvcHours,
    dailyData
  };
};
