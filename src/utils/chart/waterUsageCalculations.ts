
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

  // Log the first few measurements for debugging
  console.log("Sample of measurements for flow rate calculation:", 
    measurements.slice(0, 3).map(m => ({
      unitId: m.unitId,
      timestamp: new Date(m.timestamp).toISOString(),
      volume: m.volume,
      unit_type: m.unit_type
    }))
  );

  // Group measurements by unitId first
  const unitMeasurements: { [unitId: string]: any[] } = {};
  
  measurements.forEach(measurement => {
    if (!measurement.timestamp) return;
    
    const unitId = measurement.unitId || measurement.id || 'unknown';
    
    if (!unitMeasurements[unitId]) {
      unitMeasurements[unitId] = [];
    }
    
    // Ensure timestamp is a Date object
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
      hour: format(timestamp, 'HH:00')
    });
  });

  // Initialize results object with all 24 hours
  const hourlyResults: { [hour: string]: { volume: number, unitIds: Set<string> } } = {};
  
  // Create entries for all 24 hours to ensure complete chart
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const hourDate = new Date(now);
    hourDate.setHours(i, 0, 0, 0);
    const hourKey = format(hourDate, 'HH:00');
    hourlyResults[hourKey] = { volume: 0, unitIds: new Set() };
  }
  
  // Process each unit separately to calculate hourly changes in cumulative volumes
  Object.entries(unitMeasurements).forEach(([unitId, unitData]) => {
    // Skip if less than 2 measurements for this unit
    if (unitData.length < 2) return;
    
    // Sort by timestamp (ensuring chronological order)
    unitData.sort((a, b) => a.normalizedTimestamp.getTime() - b.normalizedTimestamp.getTime());
    
    // Check if data appears to be cumulative by looking at first few points
    let isCumulative = true;
    for (let i = 1; i < Math.min(unitData.length, 5); i++) {
      if (unitData[i].normalizedVolume < unitData[i-1].normalizedVolume) {
        isCumulative = false;
        break;
      }
    }
    
    console.log(`Unit ${unitId}: ${isCumulative ? 'cumulative' : 'direct'} measurements detected`);
    
    if (isCumulative) {
      // Process consecutive measurements to calculate deltas by hour
      for (let i = 1; i < unitData.length; i++) {
        const prevMeasurement = unitData[i-1];
        const currMeasurement = unitData[i];
        
        const prevTimestamp = prevMeasurement.normalizedTimestamp;
        const currTimestamp = currMeasurement.normalizedTimestamp;
        
        // Skip if measurements are more than 2 hours apart or if volume decreased (meter reset)
        const hoursDiff = (currTimestamp.getTime() - prevTimestamp.getTime()) / (1000 * 60 * 60);
        if (hoursDiff > 2 || currMeasurement.normalizedVolume < prevMeasurement.normalizedVolume) {
          continue;
        }
        
        const volumeDelta = currMeasurement.normalizedVolume - prevMeasurement.normalizedVolume;
        
        // If delta is significant (and not negative from resets), assign to the current hour
        if (volumeDelta > 0) {
          const hour = format(currTimestamp, 'HH:00');
          
          // Only add if the delta isn't unreasonably large (unlikely to use >50m³ in an hour)
          const reasonableDelta = Math.min(volumeDelta, 50);
          
          hourlyResults[hour].volume += reasonableDelta;
          hourlyResults[hour].unitIds.add(unitId);
          
          console.log(`Hour ${hour} - Unit ${unitId}: Delta ${volumeDelta.toFixed(4)}m³ (${prevMeasurement.normalizedVolume.toFixed(4)} -> ${currMeasurement.normalizedVolume.toFixed(4)})`);
        }
      }
    } else {
      // For direct flow measurements (non-cumulative)
      unitData.forEach(measurement => {
        const hour = measurement.hour;
        let flowRate = 0;
        
        if (typeof measurement.flow_rate === 'number') {
          flowRate = measurement.flow_rate;
        } else if (typeof measurement.flow === 'number') {
          flowRate = measurement.flow;
        } else if (typeof measurement.normalizedVolume === 'number') {
          // Use the direct volume reading for non-cumulative data
          flowRate = measurement.normalizedVolume;
        }
        
        if (flowRate > 0) {
          hourlyResults[hour].volume += flowRate;
          hourlyResults[hour].unitIds.add(unitId);
        }
      });
    }
  });

  // Convert to array format for the chart
  const result: FlowRate[] = Object.entries(hourlyResults).map(([hour, data]) => ({
    name: hour,
    volume: Number(data.volume.toFixed(4)),
    unitIds: Array.from(data.unitIds)
  }));
  
  // Sort by hour
  result.sort((a, b) => {
    const hourA = parseInt(a.name.split(':')[0]);
    const hourB = parseInt(b.name.split(':')[0]);
    return hourA - hourB;
  });
  
  // Log total flow rates
  const totalFlow = result.reduce((sum, item) => sum + item.volume, 0);
  console.log(`Total flow across all hours: ${totalFlow.toFixed(4)}m³`);
  console.log(`Hours with data: ${result.filter(r => r.volume > 0).length}`);
  
  return result;
};
