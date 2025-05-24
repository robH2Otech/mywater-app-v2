
/**
 * Utility functions to format unit volumes and calculate environmental impact metrics
 */

// Bottle configuration constants
export const BOTTLE_CONFIGS = {
  small: { size: 0.5, cost: 1.1, plastic: 20 }, // 0.5L bottle, €1.10, 20g plastic
  medium: { size: 1.0, cost: 1.5, plastic: 40 }, // 1.0L bottle, €1.50, 40g plastic
  large: { size: 1.5, cost: 2.0, plastic: 60 }, // 1.5L bottle, €2.00, 60g plastic
  xlarge: { size: 2.0, cost: 2.5, plastic: 80 } // 2.0L bottle, €2.50, 80g plastic
};

// Default daily water intake recommendation (in liters)
export const DEFAULT_DAILY_INTAKE = 2.0;

/**
 * Calculates the number of plastic bottles saved
 * @param litersConsumed - Amount of water consumed in liters
 * @param bottleSize - Size of bottle in liters (default: 0.5L)
 * @returns Number of bottles saved
 */
export const calculateBottlesSaved = (
  litersConsumed: number, 
  bottleSize: number = BOTTLE_CONFIGS.small.size
): number => {
  return litersConsumed / bottleSize;
};

/**
 * Calculates money saved by not purchasing bottled water
 * @param bottlesSaved - Number of bottles saved
 * @param bottleCost - Cost per bottle in euros (default: €1.10)
 * @returns Money saved in euros
 */
export const calculateMoneySaved = (
  bottlesSaved: number,
  bottleCost: number = BOTTLE_CONFIGS.small.cost
): number => {
  return bottlesSaved * bottleCost;
};

/**
 * Calculates CO2 emissions reduction (321g per liter)
 * @param litersConsumed - Amount of water consumed in liters
 * @returns CO2 reduction in kg
 */
export const calculateCO2Reduction = (
  litersConsumed: number
): number => {
  return (litersConsumed * 321) / 1000; // Convert from g to kg
};

/**
 * Calculates plastic waste reduction (40g per liter)
 * @param litersConsumed - Amount of water consumed in liters
 * @returns Plastic reduction in kg
 */
export const calculatePlasticReduction = (
  litersConsumed: number
): number => {
  return (litersConsumed * 40) / 1000; // Convert from g to kg
};

/**
 * Calculates energy saved (1.55 kWh per liter)
 * @param litersConsumed - Amount of water consumed in liters
 * @returns Energy saved in kWh
 */
export const calculateEnergySaved = (
  litersConsumed: number
): number => {
  return litersConsumed * 1.55;
};

/**
 * Calculates water waste prevented (3.5L waste per 1.5L produced = 2.33L per 1L)
 * @param litersConsumed - Amount of water consumed in liters
 * @returns Water waste prevented in liters
 */
export const calculateWaterWastePrevented = (
  litersConsumed: number
): number => {
  return litersConsumed * 2.33; // 3.5L waste per 1.5L produced
};

/**
 * Formats a metric value for display with appropriate units
 * @param value - Numeric value to format
 * @param metricType - Type of metric ('bottles', 'plastic', 'co2', 'money', 'energy', 'water')
 * @returns Formatted string
 */
export const formatMetricValue = (
  value: number,
  metricType: 'bottles' | 'plastic' | 'co2' | 'money' | 'energy' | 'water'
): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  } else {
    return value.toFixed(1);
  }
};

/**
 * Calculates environmental equivalents for CO2 and plastic reduction
 * @param co2Saved - CO2 reduction in kg
 * @param plasticSaved - Plastic reduction in kg
 * @returns Object with equivalent metrics
 */
export const getEnvironmentalEquivalents = (
  co2Saved: number,
  plasticSaved: number
) => {
  return {
    // Driving a car produces ~120g CO2 per km, so dividing by 0.12 gives km saved
    carKilometers: Math.round(co2Saved / 0.12),
    
    // One tree absorbs ~20kg CO2 per year
    treesEquivalent: Math.round(co2Saved / 20),
    
    // One smartphone charge ~0.01kg CO2
    smartphoneCharges: Math.round(co2Saved / 0.01),
    
    // Each kg of recycled plastic saves ~1.5kg CO2
    recyclingEquivalent: Math.round(plasticSaved * 1.5)
  };
};
