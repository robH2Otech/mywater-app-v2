
import { format } from "date-fns";

export interface FlowRate {
  name: string;
  volume: number;
  unitIds?: string[];  // Track which units contributed to this value
}

/**
 * Calculates the hourly flow rate for each hour in the last 24 hours.
 * Each value represents the actual water used during that hour, not cumulative.
 * 
 * @param measurements - Array of measurement objects ({timestamp, volume, unitId, unit_type, ...})
 * @returns Array of FlowRate objects with { name: "HH:00", volume }
 */
export const calculateHourlyFlowRates = (measurements: any[]): FlowRate[] => {
  if (!measurements || measurements.length < 2) {
    console.log("Not enough measurements to calculate flow rates", measurements);
    return [];
  }

  // Convert liters to cubic meters for DROP or OFFICE units
  const normalizedMeasurements = measurements.map(measurement => {
    const isLiterUnit = measurement.unit_type === 'drop' || measurement.unit_type === 'office';
    
    // Parse volume to ensure it's a number
    let volume = typeof measurement.volume === 'number' 
      ? measurement.volume 
      : parseFloat(measurement.volume || '0');
      
    // Convert liters to cubic meters if needed
    if (isLiterUnit && !isNaN(volume)) {
      volume = volume / 1000;
    }
    
    return {
      ...measurement,
      normalizedVolume: volume,
      timestamp: measurement.timestamp instanceof Date 
        ? measurement.timestamp 
        : new Date(measurement.timestamp)
    };
  });

  // Group measurements by unit ID and then by hour
  // This allows us to calculate the flow rate for each unit separately
  const unitHourlyData: { [key: string]: { [hour: string]: any[] } } = {};
  
  normalizedMeasurements.forEach(measurement => {
    if (!measurement.timestamp) return;
    
    const unitId = measurement.unitId || measurement.id || 'unknown';
    const hourKey = measurement.timestamp.getHours().toString().padStart(2, '0') + ':00';
    
    if (!unitHourlyData[unitId]) {
      unitHourlyData[unitId] = {};
    }
    
    if (!unitHourlyData[unitId][hourKey]) {
      unitHourlyData[unitId][hourKey] = [];
    }
    
    unitHourlyData[unitId][hourKey].push(measurement);
  });

  // Calculate flow rates for each unit and hour
  const unitFlowRates: { [hour: string]: { volume: number, unitIds: string[] } } = {};
  
  // Initialize all hours with zero values
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0') + ':00');
  hours.forEach(hour => {
    unitFlowRates[hour] = { volume: 0, unitIds: [] };
  });
  
  // Calculate flow rate for each unit
  Object.entries(unitHourlyData).forEach(([unitId, hourlyData]) => {
    Object.entries(hourlyData).forEach(([hourKey, measurements]) => {
      // Sort measurements by timestamp
      measurements.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      if (measurements.length < 2) return;
      
      // Calculate volume difference between first and last measurement in this hour
      const firstMeasurement = measurements[0];
      const lastMeasurement = measurements[measurements.length - 1];
      
      let hourlyUsage = lastMeasurement.normalizedVolume - firstMeasurement.normalizedVolume;
      
      // Only consider positive deltas as actual usage
      if (hourlyUsage <= 0) return;
      
      // Cap unreasonable values at 10 m³ per hour per unit
      if (hourlyUsage > 10) hourlyUsage = 10;
      
      // Add this unit's usage to the hourly total
      unitFlowRates[hourKey].volume += hourlyUsage;
      unitFlowRates[hourKey].unitIds.push(unitId);
    });
  });

  // Convert to array and format values
  const result: FlowRate[] = Object.entries(unitFlowRates).map(([hour, data]) => ({
    name: hour,
    volume: Number(data.volume.toFixed(2)),
    unitIds: data.unitIds
  }));
  
  // Sort by hour
  result.sort((a, b) => {
    const hourA = parseInt(a.name.split(':')[0]);
    const hourB = parseInt(b.name.split(':')[0]);
    return hourA - hourB;
  });
  
  console.log("Calculated hourly flow rates:", result);
  
  return result;
};
