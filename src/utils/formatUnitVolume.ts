
/**
 * Format volume values based on unit type
 * DROP units use L (liters), other units use m³ (cubic meters)
 */
export function formatVolumeWithUnits(volume: number | string | undefined, unitType?: string): string {
  if (volume === undefined) return '0';
  
  // Convert volume to number if it's a string
  const numericVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
  
  // Format based on unit type
  if (unitType === 'drop') {
    // For DROP units, use liters (L)
    return `${numericVolume.toLocaleString()}L`;
  } else {
    // For all other units, use cubic meters (m³)
    return `${numericVolume.toLocaleString()}m³`;
  }
}
