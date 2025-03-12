
/**
 * Utility functions for determining UVC status based on operational hours
 */

// Maximum UVC bulb lifetime in hours
export const MAX_UVC_HOURS = 15000;

// Warning threshold at 10,001 hours
export const WARNING_THRESHOLD = 10001;

// Urgent threshold at 14,000 hours
export const URGENT_THRESHOLD = 14000;

/**
 * Determines the status of a UVC system based on its operational hours
 * @param hours The total operational hours of the UVC system
 * @returns The status ('active', 'warning', or 'urgent')
 */
export const determineUVCStatus = (hours: number | string | null): 'active' | 'warning' | 'urgent' => {
  if (hours === null || hours === undefined) return 'active';
  
  const numericHours = typeof hours === 'string' ? parseFloat(hours) : hours;
  
  if (isNaN(numericHours)) return 'active';
  
  if (numericHours < WARNING_THRESHOLD) return 'active';
  if (numericHours < URGENT_THRESHOLD) return 'warning';
  return 'urgent';
};

/**
 * Creates an alert message based on UVC status
 * @param unitName The name of the water unit
 * @param hours The total operational hours of the UVC system
 * @param status The determined status
 * @returns An appropriate alert message
 */
export const createUVCAlertMessage = (unitName: string, hours: number | string | null, status: string): string => {
  const numericHours = typeof hours === 'string' ? parseFloat(hours) : (hours || 0);
  const hoursRemaining = MAX_UVC_HOURS - numericHours;
  
  switch (status) {
    case 'urgent':
      return `URGENT: ${unitName} UVC bulb has reached ${numericHours.toLocaleString()} operational hours (${hoursRemaining.toLocaleString()} hours before max). Replacement required soon.`;
    case 'warning':
      return `WARNING: ${unitName} UVC bulb has ${hoursRemaining.toLocaleString()} hours remaining before replacement (current: ${numericHours.toLocaleString()} hours). Schedule maintenance within next service period.`;
    default:
      return '';
  }
};

/**
 * Calculates the percentage of UVC bulb life used
 * @param hours The total operational hours of the UVC system
 * @returns The percentage of bulb life used (0-100)
 */
export const calculateUVCLifePercentage = (hours: number | string | null): number => {
  if (hours === null || hours === undefined) return 0;
  
  const numericHours = typeof hours === 'string' ? parseFloat(hours) : hours;
  
  if (isNaN(numericHours)) return 0;
  
  const percentage = (numericHours / MAX_UVC_HOURS) * 100;
  
  return Math.min(Math.max(percentage, 0), 100);
};
