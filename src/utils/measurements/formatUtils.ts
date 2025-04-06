
/**
 * Utility functions for formatting measurement data
 */

/**
 * Format a number with thousands separators
 */
export const formatThousands = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return "0";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Format volume based on unit type
 */
export const formatVolumeByUnitType = (volume: number | string | undefined | null, unitType: string): string => {
  if (volume === undefined || volume === null) return "0";
  const numericVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
  if (isNaN(numericVolume)) return "0";
  
  if (unitType === 'uvc') {
    return `${Math.round(numericVolume)}m³`;
  } else {
    return `${Math.round(numericVolume)}L`;
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
 * Safely format a timestamp from various formats
 */
export const safeFormatTimestamp = (timestamp: any): string => {
  try {
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
