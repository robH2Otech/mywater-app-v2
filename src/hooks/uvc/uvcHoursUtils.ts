
import { Measurement } from "@/utils/measurements/types";

/**
 * Calculates total UVC hours based on base hours, measurement data, and accumulation flag
 */
export function calculateTotalUVCHours(
  baseUvcHours: number, 
  measurementData: { latestMeasurementUvcHours: number; hasMeasurementData: boolean },
  isUvcAccumulated?: boolean
): number {
  // For UVC units, we should prioritize measurement data as it's more current
  if (measurementData.hasMeasurementData && measurementData.latestMeasurementUvcHours > 0) {
    // Use the measurement value directly
    console.log(`Using measurement hours directly: ${measurementData.latestMeasurementUvcHours}`);
    return measurementData.latestMeasurementUvcHours;
  }
  
  // Fallback to base hours if no measurement data
  console.log(`Using base UVC hours: ${baseUvcHours}`);
  return baseUvcHours;
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
