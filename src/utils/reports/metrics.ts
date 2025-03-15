
import { format } from "date-fns";

// Calculate aggregated metrics from measurements
export const calculateMetricsFromMeasurements = (measurements: any[]) => {
  if (!measurements || !measurements.length) {
    console.log("No measurements provided to calculate metrics");
    return {
      totalVolume: 0,
      avgVolume: 0,
      maxVolume: 0,
      avgTemperature: 0,
      totalUvcHours: 0,
      dailyData: []
    };
  }
  
  console.log(`Calculating metrics from ${measurements.length} measurements`);
  
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
      let day;
      try {
        // Safely extract the date portion
        if (typeof measurement.timestamp === 'string') {
          day = measurement.timestamp.split('T')[0];
        } else if (measurement.timestamp instanceof Date) {
          day = format(measurement.timestamp, 'yyyy-MM-dd');
        } else {
          console.warn("Unexpected timestamp format:", measurement.timestamp);
          day = format(new Date(), 'yyyy-MM-dd');
        }
        
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
      } catch (error) {
        console.error("Error processing measurement day:", error, measurement);
      }
    }
  });
  
  // Calculate averages for each day
  const dailyData = Array.from(dailyMap.values()).map(day => ({
    date: day.date,
    volume: day.volume,
    avgVolume: day.count > 0 ? day.volume / day.count : 0,
    avgTemperature: day.count > 0 ? day.temperature / day.count : 0,
    uvcHours: day.uvcHours
  }));
  
  // Sort by date
  dailyData.sort((a, b) => a.date.localeCompare(b.date));
  
  const measCount = measurements.length || 1; // Avoid division by zero
  
  return {
    totalVolume,
    avgVolume: totalVolume / measCount,
    maxVolume,
    avgTemperature: totalTemperature / measCount,
    totalUvcHours,
    dailyData
  };
};
