
import { format } from "date-fns";
import { detectCumulativeData, calculateVolumeDelta, convertToM3 } from "./volumeCalculations";

export interface FlowRate {
  name: string;
  volume: number;
  unitIds?: string[];
}

export const calculateHourlyFlowRates = (measurements: any[]): FlowRate[] => {
  if (!measurements || measurements.length < 2) {
    console.log("calculateHourlyFlowRates - Not enough measurements:", measurements?.length || 0);
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
    const unitId = measurement.unitId || measurement.unit_id || measurement.id || 'unknown';
    if (!unitMeasurements[unitId]) {
      unitMeasurements[unitId] = [];
    }
    unitMeasurements[unitId].push(measurement);
  });

  console.log("calculateHourlyFlowRates - Units found:", Object.keys(unitMeasurements));

  // Process each unit's data
  Object.entries(unitMeasurements).forEach(([unitId, unitData]) => {
    if (unitData.length < 2) {
      console.log(`calculateHourlyFlowRates - Not enough data for unit ${unitId}:`, unitData.length);
      return;
    }

    // Sort measurements chronologically (oldest first for cumulative calculation)
    unitData.sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
      const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
      return timeA.getTime() - timeB.getTime();
    });
    
    const isCumulative = detectCumulativeData(unitData);
    console.log(`calculateHourlyFlowRates - Unit ${unitId}: ${isCumulative ? 'cumulative' : 'direct'} measurements, ${unitData.length} points`);

    if (isCumulative) {
      // Process consecutive measurements for cumulative data
      for (let i = 1; i < unitData.length; i++) {
        const prev = unitData[i-1];
        const curr = unitData[i];
        
        // Skip if measurements are more than 2 hours apart
        const hoursDiff = (curr.timestamp.getTime() - prev.timestamp.getTime()) / (1000 * 60 * 60);
        if (hoursDiff > 2) {
          console.log(`calculateHourlyFlowRates - Skipping measurement pair due to time gap: ${hoursDiff} hours`);
          continue;
        }

        // Get volume values and determine unit type
        const currentVol = curr.volume || curr.total_volume || 0;
        const prevVol = prev.volume || prev.total_volume || 0;
        
        // Determine if this is a UVC unit (m³) or DROP/Office unit (L)
        const isUVCUnit = unitId.includes('UVC') || unitId.includes('MYWATER') || curr.unit_type === 'uvc';
        
        let volumeDelta;
        if (isUVCUnit) {
          // UVC units are already in m³
          volumeDelta = calculateVolumeDelta(currentVol, prevVol);
        } else {
          // DROP/Office units in liters - convert to m³ for consistency
          volumeDelta = calculateVolumeDelta(currentVol / 1000, prevVol / 1000);
        }

        if (volumeDelta > 0) {
          const hour = format(curr.timestamp, 'HH:00');
          hourlyResults[hour].volume += volumeDelta;
          hourlyResults[hour].unitIds.add(unitId);
          
          console.log(`calculateHourlyFlowRates - Added ${volumeDelta} m³ for hour ${hour} from unit ${unitId}`);
        }
      }
    } else {
      // For direct flow measurements
      unitData.forEach(measurement => {
        const hour = format(measurement.timestamp, 'HH:00');
        let volume = measurement.volume || measurement.total_volume || 0;
        
        // Determine if this is a UVC unit (m³) or DROP/Office unit (L)
        const isUVCUnit = unitId.includes('UVC') || unitId.includes('MYWATER') || measurement.unit_type === 'uvc';
        
        if (!isUVCUnit) {
          // Convert liters to m³
          volume = volume / 1000;
        }
        
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

  console.log("calculateHourlyFlowRates - Final result:", result.filter(r => r.volume > 0));
  return result;
};
