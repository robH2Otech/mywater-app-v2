
/**
 * Business UVC Water Purification System Calculations
 * Based on cubic meter flow rates and professional KPIs
 */

export interface UVCBusinessMetrics {
  waterProcessed: number;        // m³
  energySaved: number;          // kWh  
  waterWastePrevented: number;  // m³
  costEquivalence: number;      // €
  operationalHours: number;     // hours
  systemUptime: number;         // percentage
  maintenanceEfficiency: number; // percentage
}

export interface UVCFlowConfig {
  flowRate: number;             // m³/hour (typical 2-10 m³/h)
  operatingHours: number;       // hours per day
  daysInPeriod: number;         // days
  energyRate: number;           // €/kWh
  waterCostRate: number;        // €/m³  
}

// Business calculation constants
export const UVC_CONSTANTS = {
  ENERGY_SAVED_PER_M3: 1.55,     // kWh per m³
  WATER_WASTE_PREVENTED_RATIO: 2.33, // m³ waste prevented per m³ purified
  COST_EQUIVALENCE_PER_M3: 0.02,     // €0.02 per m³
  TYPICAL_FLOW_RATES: {
    small: 2,    // m³/h - Small office
    medium: 5,   // m³/h - Hotel/School  
    large: 10    // m³/h - Factory/Hospital
  }
};

/**
 * Calculate business UVC metrics based on water volume processed
 */
export function calculateBusinessUVCMetrics(
  waterProcessed: number, // m³
  config: Partial<UVCFlowConfig> = {}
): UVCBusinessMetrics {
  const defaultConfig: UVCFlowConfig = {
    flowRate: UVC_CONSTANTS.TYPICAL_FLOW_RATES.medium,
    operatingHours: 16, // 16 hours per day typical
    daysInPeriod: 30,
    energyRate: 0.25, // €0.25/kWh
    waterCostRate: 2.5 // €2.50/m³
  };
  
  const fullConfig = { ...defaultConfig, ...config };
  
  // Core calculations
  const energySaved = waterProcessed * UVC_CONSTANTS.ENERGY_SAVED_PER_M3;
  const waterWastePrevented = waterProcessed * UVC_CONSTANTS.WATER_WASTE_PREVENTED_RATIO;
  const costEquivalence = waterProcessed * UVC_CONSTANTS.COST_EQUIVALENCE_PER_M3;
  
  // Operational metrics
  const totalPossibleHours = fullConfig.operatingHours * fullConfig.daysInPeriod;
  const actualOperatingHours = waterProcessed / fullConfig.flowRate;
  const systemUptime = Math.min((actualOperatingHours / totalPossibleHours) * 100, 100);
  
  // Maintenance efficiency based on expected vs actual performance
  const expectedWaterProcessed = fullConfig.flowRate * totalPossibleHours;
  const maintenanceEfficiency = Math.min((waterProcessed / expectedWaterProcessed) * 100, 100);
  
  return {
    waterProcessed,
    energySaved,
    waterWastePrevented,
    costEquivalence,
    operationalHours: actualOperatingHours,
    systemUptime,
    maintenanceEfficiency
  };
}

/**
 * Calculate cost savings including energy and water costs
 */
export function calculateCostSavings(metrics: UVCBusinessMetrics, config: Partial<UVCFlowConfig> = {}) {
  const energyRate = config.energyRate || 0.25;
  const waterCostRate = config.waterCostRate || 2.5;
  
  const energyCostSavings = metrics.energySaved * energyRate;
  const waterCostSavings = metrics.waterWastePrevented * waterCostRate;
  const totalCostSavings = energyCostSavings + waterCostSavings + metrics.costEquivalence;
  
  return {
    energyCostSavings,
    waterCostSavings,
    operationalSavings: metrics.costEquivalence,
    totalCostSavings
  };
}

/**
 * Format business metrics for display
 */
export function formatBusinessMetric(value: number, type: 'volume' | 'energy' | 'cost' | 'percentage'): string {
  switch (type) {
    case 'volume':
      return `${value.toFixed(1)} m³`;
    case 'energy':
      return `${value.toFixed(1)} kWh`;
    case 'cost':
      return `€${value.toFixed(2)}`;
    case 'percentage':
      return `${value.toFixed(1)}%`;
    default:
      return value.toString();
  }
}

/**
 * Generate mock data for multiple locations/branches
 */
export function generateMultiLocationData(locationCount: number = 4) {
  const locations = [
    'Headquarters', 'Branch Office A', 'Manufacturing Plant', 'Distribution Center',
    'Hotel Complex', 'School Campus', 'Medical Facility', 'Research Lab'
  ];
  
  return locations.slice(0, locationCount).map((location, index) => {
    const baseVolume = 50 + (index * 30) + Math.random() * 20;
    const metrics = calculateBusinessUVCMetrics(baseVolume);
    const costSavings = calculateCostSavings(metrics);
    
    return {
      location,
      metrics,
      costSavings,
      efficiency: 85 + Math.random() * 15,
      lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + (30 + Math.random() * 60) * 24 * 60 * 60 * 1000)
    };
  });
}
