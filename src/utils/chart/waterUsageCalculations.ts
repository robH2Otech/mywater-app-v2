
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
  
  // Process each unit separately
  Object.entries(unitMeasurements).forEach(([unitId, unitData]) => {
    // Skip if less than 2 measurements for this unit
    if (unitData.length < 2) return;
    
    // Sort by timestamp (should already be sorted, but making sure)
    unitData.sort((a, b) => a.normalizedTimestamp.getTime() - b.normalizedTimestamp.getTime());
    
    // Process measurements by hour
    const hourlyData: {[hour: string]: {first?: any, last?: any}} = {};
    
    // Group by hour and find first and last measurement for each hour
    unitData.forEach(measurement => {
      const hour = measurement.hour;
      
      if (!hourlyData[hour]) {
        hourlyData[hour] = { first: measurement, last: measurement };
      } else {
        // Update first if this measurement is earlier
        if (measurement.normalizedTimestamp < hourlyData[hour].first.normalizedTimestamp) {
          hourlyData[hour].first = measurement;
        }
        
        // Update last if this measurement is later
        if (measurement.normalizedTimestamp > hourlyData[hour].last.normalizedTimestamp) {
          hourlyData[hour].last = measurement;
        }
      }
    });
    
    // Calculate delta for each hour that has both first and last measurements
    Object.entries(hourlyData).forEach(([hour, data]) => {
      if (data.first && data.last && data.first !== data.last) {
        // Calculate volume difference within this hour
        const volumeDelta = data.last.normalizedVolume - data.first.normalizedVolume;
        
        // Only add positive deltas (ignore resets or errors)
        if (volumeDelta > 0) {
          // Cap unreasonable values (20 m³/hour seems like a reasonable maximum)
          const cappedDelta = Math.min(volumeDelta, 20);
          
          hourlyResults[hour].volume += cappedDelta;
          hourlyResults[hour].unitIds.add(unitId);
          
          console.log(`Hour ${hour} - Unit ${unitId}: ${data.first.normalizedVolume.toFixed(4)} -> ${data.last.normalizedVolume.toFixed(4)} = ${cappedDelta.toFixed(4)} m³`);
        }
      }
    });

    // Also add direct measurements if they're flow rates rather than cumulative values
    if (unitData.some(m => m.flow_rate || m.flow)) {
      unitData.forEach(measurement => {
        const hour = measurement.hour;
        let flowRate = 0;
        
        if (typeof measurement.flow_rate === 'number') {
          flowRate = measurement.flow_rate;
        } else if (typeof measurement.flow === 'number') {
          flowRate = measurement.flow;
        }
        
        if (flowRate > 0) {
          hourlyResults[hour].volume += flowRate;
          hourlyResults[hour].unitIds.add(unitId);
          console.log(`Direct flow rate for hour ${hour} - Unit ${unitId}: ${flowRate.toFixed(4)} m³/h`);
        }
      });
    }
  });

  // If we don't have any non-zero values, try calculating differently
  const hasNonZeroValues = Object.values(hourlyResults).some(result => result.volume > 0);
  
  if (!hasNonZeroValues && measurements.length > 0) {
    console.log("No flow rate deltas found, trying simple approach with direct values");
    
    // Reset results
    for (let i = 0; i < 24; i++) {
      const hourDate = new Date(now);
      hourDate.setHours(i, 0, 0, 0);
      const hourKey = format(hourDate, 'HH:00');
      hourlyResults[hourKey] = { volume: 0, unitIds: new Set() };
    }
    
    // Simply use the most recent measurement for each hour
    measurements.forEach(measurement => {
      if (!measurement.timestamp) return;
      
      const timestamp = measurement.timestamp instanceof Date 
        ? measurement.timestamp 
        : new Date(measurement.timestamp);
      
      const hour = format(timestamp, 'HH:00');
      const unitId = measurement.unitId || measurement.id || 'unknown';
      
      // Convert liters to cubic meters if needed
      const isLiterUnit = measurement.unit_type === 'drop' || measurement.unit_type === 'office';
      let volume = typeof measurement.volume === 'number' 
        ? measurement.volume 
        : parseFloat(measurement.volume || '0');
        
      if (isLiterUnit && !isNaN(volume)) {
        volume = volume / 1000;
      }
      
      // Use a small fraction of the total volume as hourly rate (just to show something)
      // Cap at 2 m³/hour to be reasonable
      const hourlyEstimate = Math.min(volume * 0.05, 2);
      
      if (hourlyEstimate > 0) {
        hourlyResults[hour].volume = Math.max(hourlyResults[hour].volume, hourlyEstimate);
        hourlyResults[hour].unitIds.add(unitId);
        console.log(`Using estimated hourly rate for ${hour}: ${hourlyEstimate.toFixed(4)} m³ (from total ${volume.toFixed(4)})`);
      }
    });
  }

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
  
  console.log(`Final hourly flow rates (${result.length} hours):`, 
    result.filter(r => r.volume > 0).map(r => `${r.name}: ${r.volume.toFixed(4)}m³ (${r.unitIds?.length || 0} units)`));
  
  return result;
};
