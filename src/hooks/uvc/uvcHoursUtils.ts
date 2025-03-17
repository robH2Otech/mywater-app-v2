
import { Measurement } from "@/utils/measurements/types";

/**
 * Calculates total UVC hours based on base hours, measurement data, and accumulation flag
 */
export function calculateTotalUVCHours(
  baseUvcHours: number, 
  measurementData: { latestMeasurementUvcHours: number; hasMeasurementData: boolean },
  isUvcAccumulated?: boolean
): number {
  let totalUvcHours = baseUvcHours;
  
  // If we have measurement data, add it to the base UVC hours, but only if the
  // unit is not already using accumulated values
  if (measurementData.hasMeasurementData && !isUvcAccumulated) {
    totalUvcHours += measurementData.latestMeasurementUvcHours;
    console.log(`Adding measurement hours to base: ${baseUvcHours} + ${measurementData.latestMeasurementUvcHours} = ${totalUvcHours}`);
  } else if (isUvcAccumulated) {
    console.log(`Using accumulated hours (${baseUvcHours}), not adding measurement hours`);
  }
  
  return totalUvcHours;
}

/**
 * Ensures UVC hours value is a valid number
 */
export function normalizeUVCHours(value: unknown): number {
  if (typeof value === 'string') {
    return parseFloat(value);
  } else if (typeof value === 'number') {
    return value;
  } else if (value === undefined || value === null) {
    return 0;
  }
  return 0;
}
