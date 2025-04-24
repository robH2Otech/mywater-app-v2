
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

  // Initialize results object with all 24 hours
  const hourlyResults: { [hour: string]: { volume: number, unitIds: Set<string> } } = {};
  
  // Create entries for all 24 hours to ensure complete chart
  for (let i = 0; i < 24; i++) {
    const hourKey = i.toString().padStart(2, '0') + ':00';
    hourlyResults[hourKey] = { volume: 0, unitIds: new Set() };
  }

  // Group measurements by unitId first
  const unitMeasurements: { [unitId: string]: any[] } = {};

  // Parse and normalize measurement data
  measurements.forEach(measurement => {
    if (!measurement.timestamp) return;
    
    const unitId = measurement.unitId || measurement.id || 'unknown';
    
    if (!unitMeasurements[unitId]) {
      unitMeasurements[unitId] = [];
    }
    
    // Create a copy with normalized data
    const timestamp = measurement.timestamp instanceof Date 
      ? measurement.timestamp 
      : new Date(measurement.timestamp);
    
    // Convert liters to cubic meters for DROP or OFFICE units
    const isLiterUnit = measurement.unit_type === 'drop' || measurement.unit_type === 'office';
    let volume = typeof measurement.volume === 'number' 
      ? measurement.volume 
      : parseFloat(measurement.volume || '0');
      
    // Convert liters to cubic meters if needed
    if (isLiterUnit && !isNaN(volume)) {
      volume = volume / 1000;
    }
    
    unitMeasurements[unitId].push({
      ...measurement,
      normalizedTimestamp: timestamp,
      normalizedVolume: volume,
      hour: timestamp.getHours().toString().padStart(2, '0') + ':00'
    });
  });

  // Process each unit separately
  Object.entries(unitMeasurements).forEach(([unitId, unitData]) => {
    // Skip if less than 2 measurements for this unit
    if (unitData.length < 2) return;
    
    // Sort by timestamp
    unitData.sort((a, b) => a.normalizedTimestamp.getTime() - b.normalizedTimestamp.getTime());
    
    // Group measurements by hour
    const measurementsByHour: { [hour: string]: any[] } = {};
    
    unitData.forEach(measurement => {
      const hourKey = measurement.hour;
      
      if (!measurementsByHour[hourKey]) {
        measurementsByHour[hourKey] = [];
      }
      
      measurementsByHour[hourKey].push(measurement);
    });
    
    // Calculate flow rate for each hour
    Object.entries(measurementsByHour).forEach(([hour, hourMeasurements]) => {
      if (hourMeasurements.length < 2) return;
      
      // Get first and last measurement in this hour
      const firstMeasurement = hourMeasurements[0];
      const lastMeasurement = hourMeasurements[hourMeasurements.length - 1];
      
      // Calculate usage as difference between last and first measurement in this hour
      let hourlyUsage = lastMeasurement.normalizedVolume - firstMeasurement.normalizedVolume;
      
      // Only account for positive usage (negative could be meter reset or error)
      if (hourlyUsage <= 0) return;
      
      // Cap unreasonable values (20 m³/hour seems like a reasonable maximum)
      if (hourlyUsage > 20) hourlyUsage = 20;
      
      // Add this unit's usage to the hour's total
      hourlyResults[hour].volume += hourlyUsage;
      hourlyResults[hour].unitIds.add(unitId);
      
      console.log(`Hour ${hour} - Unit ${unitId}: ${firstMeasurement.normalizedVolume} -> ${lastMeasurement.normalizedVolume} = ${hourlyUsage} m³`);
    });
  });

  // Convert results to expected format
  const result: FlowRate[] = Object.entries(hourlyResults).map(([hour, data]) => ({
    name: hour,
    volume: Number(data.volume.toFixed(2)),
    unitIds: Array.from(data.unitIds)
  }));
  
  // Sort by hour
  result.sort((a, b) => {
    const hourA = parseInt(a.name.split(':')[0]);
    const hourB = parseInt(b.name.split(':')[0]);
    return hourA - hourB;
  });
  
  console.log(`Final hourly flow rates (${result.length} hours):`, 
    result.filter(r => r.volume > 0).map(r => `${r.name}: ${r.volume}m³ (${r.unitIds?.length || 0} units)`));
  
  return result;
};
