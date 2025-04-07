
/**
 * Utility functions for formatting measurement data
 */

/**
 * Format a number with thousands separators
 */
export const formatThousands = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value) || !isFinite(value)) return "0";
  
  // Ensure the value is reasonable before formatting
  const safeValue = Math.min(value, 999999);
  
  // Format with commas for thousands - try to use locale format
  try {
    return safeValue.toLocaleString('en-US', {maximumFractionDigits: 2});
  } catch (err) {
    // Fallback to regex approach if toLocaleString fails
    return safeValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
};

/**
 * Format volume based on unit type
 */
export const formatVolumeByUnitType = (volume: number | string | undefined | null, unitType: string): string => {
  if (volume === undefined || volume === null) return "0";
  const numericVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
  if (isNaN(numericVolume) || !isFinite(numericVolume)) return "0";
  
  // Cap maximum values to prevent unrealistic numbers
  const cappedVolume = Math.min(numericVolume, 999999);
  
  if (unitType === 'uvc') {
    return `${Math.round(cappedVolume)}m³`;
  } else {
    return `${Math.round(cappedVolume)}L`;
  }
};

/**
 * Format a decimal number to 2 decimal places
 */
export const formatDecimal = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null) return "0.00";
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numericValue)) return "0.00";
  
  return numericValue.toFixed(2);
};

/**
 * Format a timestamp to human-readable format matching Firestore display
 * This will format dates like: "April 6, 2025 at 7:33:20 PM"
 */
export const formatHumanReadableTimestamp = (timestamp: any): string => {
  try {
    // Convert to Date object if needed
    let dateObj: Date;
    
    // If it's a Firestore timestamp with toDate method
    if (typeof timestamp === 'object' && timestamp !== null && typeof timestamp.toDate === 'function') {
      dateObj = timestamp.toDate();
    }
    // If it's a string, try to parse it as a date
    else if (typeof timestamp === 'string') {
      dateObj = new Date(timestamp);
    }
    // If it's already a Date object
    else if (timestamp instanceof Date) {
      dateObj = timestamp;
    }
    else {
      return "Invalid date";
    }
    
    // Format matching Firestore console: "April 6, 2025 at 7:33:20 PM"
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    
    return dateObj.toLocaleDateString('en-US', options).replace(',', '') + ' UTC' + 
           (-(dateObj.getTimezoneOffset() / 60) >= 0 ? '+' : '') + 
           (-(dateObj.getTimezoneOffset() / 60));
  } catch (err) {
    console.error("Error formatting timestamp for display:", err);
    return "Invalid date";
  }
};

/**
 * Safely format a timestamp from various formats
 */
export const safeFormatTimestamp = (timestamp: any): string => {
  try {
    // This now returns the ISO string format for internal use
    // If it's a Firestore timestamp with toDate method
    if (typeof timestamp === 'object' && timestamp !== null && typeof timestamp.toDate === 'function') {
      return formatTimestamp(timestamp.toDate());
    }
    
    // If it's a string, try to parse it as a date
    if (typeof timestamp === 'string') {
      return formatTimestamp(new Date(timestamp));
    }
    
    // If it's already a Date object
    if (timestamp instanceof Date) {
      return formatTimestamp(timestamp);
    }
    
    return "Invalid date";
  } catch (err) {
    console.error("Error formatting timestamp:", err);
    return "Invalid date";
  }
};

/**
 * Format a Date object to ISO string format
 */
export const formatTimestamp = (date: Date): string => {
  return date.toISOString();
};

/**
 * Environmental impact calculation functions
 */

/**
 * Calculate number of plastic bottles saved (2x 0.5L bottles per 1L purified water)
 */
export const calculateBottlesSaved = (litersConsumed: number): number => {
  return litersConsumed * 2; // 2 bottles (0.5L each) per 1L
};

/**
 * Calculate CO2 emissions reduction in kg (321g per 1L)
 */
export const calculateCO2Reduction = (litersConsumed: number): number => {
  return litersConsumed * 0.321; // 321g = 0.321kg per 1L
};

/**
 * Calculate plastic waste reduction in kg (40g per 1L)
 */
export const calculatePlasticReduction = (litersConsumed: number): number => {
  return litersConsumed * 0.04; // 40g = 0.04kg per 1L
};

/**
 * Format environmental impact with appropriate units
 */
export const formatEnvironmentalImpact = (value: number, unit: string): string => {
  if (value >= 1000 && unit === 'bottles') {
    return `${(value / 1000).toFixed(1)}k bottles`;
  } else if (value >= 1000 && (unit === 'kg CO₂' || unit === 'kg plastic')) {
    return `${(value / 1000).toFixed(1)} tons ${unit.substring(3)}`;
  } else if (unit === 'kg CO₂' || unit === 'kg plastic') {
    return `${value.toFixed(1)} ${unit}`;
  } else {
    return `${Math.round(value)} ${unit}`;
  }
};

/**
 * Calculate and format daily environmental impact
 */
export const calculateDailyImpact = (dailyConsumption: number) => {
  return {
    bottles: calculateBottlesSaved(dailyConsumption),
    co2: calculateCO2Reduction(dailyConsumption),
    plastic: calculatePlasticReduction(dailyConsumption)
  };
};

/**
 * Calculate and format yearly environmental impact
 */
export const calculateYearlyImpact = (dailyConsumption: number) => {
  const days = 365;
  const yearlyConsumption = dailyConsumption * days;
  
  return {
    bottles: calculateBottlesSaved(yearlyConsumption),
    co2: calculateCO2Reduction(yearlyConsumption),
    plastic: calculatePlasticReduction(yearlyConsumption)
  };
};
