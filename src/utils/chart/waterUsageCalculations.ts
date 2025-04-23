
import { format } from "date-fns";

export interface FlowRate {
  name: string;
  volume: number;
}

/**
 * Calculates the average hourly flow rate for each hour in the last 24 hours.
 * Produces an array of 24 points representing the flow for each hour between [now-23h ... now].
 * 
 * Each bar represents the average flow rate during that hour, not a cumulative value.
 * 
 * @param measurements - Array of measurement objects ({timestamp, volume, ...})
 * @returns Array of FlowRate objects with { name: "HH:00", volume }
 */
export const calculateHourlyFlowRates = (measurements: any[]): FlowRate[] => {
  if (!measurements || measurements.length < 2) {
    console.log("Not enough measurements to calculate flow rates", measurements);
    return [];
  }

  // Sort measurements by timestamp in ascending order
  const sortedMeasurements = [...measurements].sort((a, b) => {
    const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
    const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
    return timeA.getTime() - timeB.getTime();
  });

  console.log('Sorted measurements:', sortedMeasurements.length);

  // Determine if these are filter units (for optional use)
  const isFilter = measurements.some((m) => m.unit_type === 'drop' || m.unit_type === 'office');

  // Organize measurements into buckets for each hour in the last 24 hours
  const now = new Date();
  // Create 24 buckets, each key is the ISO "HH:00"
  const buckets: Record<string, any[]> = {};
  for (let offset = 23; offset >= 0; offset--) {
    const hour = new Date(now);
    hour.setMinutes(0, 0, 0); // at the hour
    hour.setHours(now.getHours() - offset);
    const hourKey = `${hour.getHours().toString().padStart(2, '0')}:00`;
    buckets[hourKey] = [];
  }

  // Place each measurement into the right hourly bucket
  for (const measurement of sortedMeasurements) {
    if (!measurement.timestamp) continue;
    const timestamp = measurement.timestamp instanceof Date
      ? measurement.timestamp
      : new Date(measurement.timestamp);

    const hourKey = `${timestamp.getHours().toString().padStart(2, '0')}:00`;
    // only try to fill buckets within the 24h window
    if (hourKey in buckets) {
      buckets[hourKey].push(measurement);
    }
  }

  // For each hour, average the flow for that hour's measurements (or take difference between latest and earliest)
  const flowRates: FlowRate[] = [];

  for (const hourKey of Object.keys(buckets)) {
    const measurements = buckets[hourKey];
    let avgFlow = 0;

    if (measurements.length > 1) {
      // Sort by time (redundant, but safe)
      const sorted = measurements.slice().sort((a, b) => {
        const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
        return timeA.getTime() - timeB.getTime();
      });

      // Calculate difference between last and first volume, divide by hour in seconds, or get average of all
      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      // Volumes for first and last
      const vFirst = typeof first.volume === "number" ? first.volume : parseFloat(first.volume ?? "0");
      const vLast = typeof last.volume === "number" ? last.volume : parseFloat(last.volume ?? "0");

      // Calculate time delta in hours
      const tFirst = first.timestamp instanceof Date ? first.timestamp : new Date(first.timestamp);
      const tLast = last.timestamp instanceof Date ? last.timestamp : new Date(last.timestamp);
      const hoursDelta = (tLast.getTime() - tFirst.getTime()) / (1000 * 60 * 60);

      // If time delta is <1s, fallback to average
      if (vLast >= vFirst && hoursDelta > 0) {
        avgFlow = Number(((vLast - vFirst) / hoursDelta).toFixed(2));
      } else {
        // fallback: mean of all
        const allVolumes = sorted
          .map(m => typeof m.volume === "number" ? m.volume : parseFloat(m.volume ?? "0"))
          .filter(v => !isNaN(v) && isFinite(v));
        if (allVolumes.length > 0) {
          avgFlow = Number((allVolumes.reduce((a, b) => a + b, 0) / allVolumes.length).toFixed(2));
        }
      }
    } else if (measurements.length === 1) {
      // With only one entry, just use that
      const v = typeof measurements[0].volume === "number"
        ? measurements[0].volume
        : parseFloat(measurements[0].volume ?? "0");
      avgFlow = isFinite(v) && !isNaN(v) ? Number(v.toFixed(2)) : 0;
    } else {
      avgFlow = 0;
    }

    flowRates.push({ name: hourKey, volume: avgFlow });
  }

  // Ensure the order is 00:00 .. 23:00 by hour
  flowRates.sort((a, b) => {
    const ha = parseInt(a.name.split(':')[0]);
    const hb = parseInt(b.name.split(':')[0]);
    return ha - hb;
  });

  console.log("Hourly flow rates (24h):", flowRates);
  return flowRates;
};
