
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

/**
 * Format specific metrics according to requirements
 */
export function formatMetricValue(value: number, metricType: 'bottles' | 'money' | 'co2' | 'plastic'): string {
  switch (metricType) {
    case 'bottles':
      return value.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
    case 'money':
      return value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    case 'co2':
    case 'plastic':
      return value.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
    default:
      return value.toLocaleString();
  }
}

/**
 * Environmental impact calculation constants
 */
export interface BottleConfig {
  size: number;        // in liters (0.5, 1.0, 1.5)
  cost: number;        // in EUR
  co2: number;         // in grams per bottle
  plastic: number;     // in grams per bottle
}

// Default bottle configurations
export const BOTTLE_CONFIGS: Record<string, BottleConfig> = {
  small: { size: 0.5, cost: 1.10, co2: 160.5, plastic: 20 },
  medium: { size: 1.0, cost: 0.75, co2: 321, plastic: 38 },
  large: { size: 1.5, cost: 0.31, co2: 481.5, plastic: 56 }
};

// Default daily water intake goal in liters
export const DEFAULT_DAILY_INTAKE = 2.0;

/**
 * Calculate bottles saved based on volume and bottle size
 */
export function calculateBottlesSaved(volumeLiters: number, bottleSize: number = 0.5): number {
  return volumeLiters / bottleSize;
}

/**
 * Calculate money saved based on bottles saved and bottle cost
 */
export function calculateMoneySaved(bottlesSaved: number, bottleCost: number = 1.10): number {
  return bottlesSaved * bottleCost;
}

/**
 * Calculate CO2 reduction based on bottles saved and CO2 per bottle
 */
export function calculateCO2Reduction(bottlesSaved: number, co2PerBottle: number = 160.5): number {
  return bottlesSaved * co2PerBottle / 1000; // convert to kg
}

/**
 * Calculate plastic reduction based on bottles saved and plastic per bottle
 */
export function calculatePlasticReduction(bottlesSaved: number, plasticPerBottle: number = 20): number {
  return bottlesSaved * plasticPerBottle / 1000; // convert to kg
}

/**
 * Generate equivalents for environmental impact
 */
export function getEnvironmentalEquivalents(co2Kg: number, plasticKg: number) {
  return {
    carKilometers: Math.round(co2Kg * 6),           // ~6km per kg of CO2
    smartphoneCharges: Math.round(co2Kg * 120),     // ~120 charges per kg of CO2
    treesEquivalent: (co2Kg / 21).toFixed(2),       // ~21kg CO2 per tree per year
    plasticBottlesWeight: Math.round(plasticKg * 50), // ~50 bottles per kg
    recyclingEquivalent: (plasticKg * 2).toFixed(1)   // impact of recycling 2x the weight
  };
}
