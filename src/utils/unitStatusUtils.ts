
/**
 * Utility functions for determining unit status based on water volume
 */

/**
 * Determines the status of a water unit based on its total volume
 * @param volume The total volume of the water unit in cubic meters
 * @returns The status ('active', 'warning', or 'urgent')
 */
export const determineUnitStatus = (volume: number | string | null): 'active' | 'warning' | 'urgent' => {
  if (!volume) return 'active';
  
  const numericVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
  
  // Updated thresholds based on actual values
  // For volumes under 500, we consider it active
  if (numericVolume < 500) return 'active';
  // For volumes between 500 and 90000, we consider it warning
  if (numericVolume <= 90000) return 'active';
  if (numericVolume <= 95000) return 'warning';
  return 'urgent';
};

/**
 * Creates an alert message based on unit status
 * @param unitName The name of the water unit
 * @param volume The total volume of the water unit
 * @param status The determined status
 * @returns An appropriate alert message
 */
export const createAlertMessage = (unitName: string, volume: number | string | null, status: string): string => {
  const numericVolume = typeof volume === 'string' ? parseFloat(volume) : (volume || 0);
  
  switch (status) {
    case 'urgent':
      return `URGENT: ${unitName} water volume is critical at ${numericVolume.toLocaleString()}m³ (>95,000m³). Immediate action required.`;
    case 'warning':
      return `WARNING: ${unitName} water volume is high at ${numericVolume.toLocaleString()}m³ (>90,000m³). Please check system.`;
    default:
      return '';
  }
};
