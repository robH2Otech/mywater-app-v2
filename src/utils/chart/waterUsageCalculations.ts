
import { format } from "date-fns";
import { detectCumulativeData, calculateVolumeDelta, convertToM3 } from "./volumeCalculations";

export interface FlowRate {
  name: string;
  volume: number;
  unitIds?: string[];
}

export const calculateHourlyFlowRates = (measurements: any[]): FlowRate[] => {
  if (!measurements || measurements.length < 2) {
    console.log("Not enough measurements to calculate flow rates", measurements);
    return [];
  }

  // Initialize results object with all 24 hours
  const hourlyResults: { [hour: string]: { volume: number, unitIds: Set<string> } } = {};
  
  // Create entries for all 24 hours
  for (let i = 0; i < 24; i++) {
    const hourKey = `${i.toString().padStart(2, '0')}:00`;
    hourlyResults[hourKey] = { volume: 0, unitIds: new Set() };
  }

  // Process measurements by unit
  const unitMeasurements: { [unitId: string]: any[] } = {};
  measurements.forEach(measurement => {
    const unitId = measurement.unitId || 'unknown';
    if (!unitMeasurements[unitId]) {
      unitMeasurements[unitId] = [];
    }
    unitMeasurements[unitId].push(measurement);
  });

  // Process each unit's data
  Object.entries(unitMeasurements).forEach(([unitId, unitData]) => {
    if (unitData.length < 2) return;

    // Sort measurements chronologically
    unitData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    const isCumulative = detectCumulativeData(unitData);
    console.log(`Unit ${unitId}: ${isCumulative ? 'cumulative' : 'direct'} measurements`);

    if (isCumulative) {
      // Process consecutive measurements for cumulative data
      for (let i = 1; i < unitData.length; i++) {
        const prev = unitData[i-1];
        const curr = unitData[i];
        
        // Skip if measurements are more than 2 hours apart
        const hoursDiff = (curr.timestamp.getTime() - prev.timestamp.getTime()) / (1000 * 60 * 60);
        if (hoursDiff > 2) continue;

        const volumeDelta = calculateVolumeDelta(
          convertToM3(curr.volume, curr.unit_type),
          convertToM3(prev.volume, prev.unit_type)
        );

        if (volumeDelta > 0) {
          const hour = format(curr.timestamp, 'HH:00');
          hourlyResults[hour].volume += volumeDelta;
          hourlyResults[hour].unitIds.add(unitId);
        }
      }
    } else {
      // For direct flow measurements
      unitData.forEach(measurement => {
        const hour = format(measurement.timestamp, 'HH:00');
        const volume = convertToM3(measurement.volume, measurement.unit_type);
        
        if (volume > 0) {
          hourlyResults[hour].volume += volume;
          hourlyResults[hour].unitIds.add(unitId);
        }
      });
    }
  });

  // Convert to array format for the chart
  const result = Object.entries(hourlyResults).map(([hour, data]) => ({
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

  return result;
};
