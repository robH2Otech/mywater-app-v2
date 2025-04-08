
import { useMemo, useState } from "react";
import { 
  BOTTLE_CONFIGS, 
  DEFAULT_DAILY_INTAKE,
  calculateBottlesSaved,
  calculateMoneySaved,
  calculateCO2Reduction,
  calculatePlasticReduction,
  getEnvironmentalEquivalents,
  formatMetricValue
} from "@/utils/formatUnitVolume";

export interface ImpactConfig {
  bottleSize: number;  // Size in liters (0.5, 1.0, 1.5)
  bottleCost: number;  // Cost in EUR
  co2PerBottle: number; // CO2 in grams per bottle
  plasticPerBottle: number; // Plastic in grams per bottle
  dailyIntake: number; // Daily water intake goal in liters
  userType: 'home'; // User type affects which metrics are shown - always 'home' now
}

// Default configuration
const DEFAULT_CONFIG: ImpactConfig = {
  bottleSize: BOTTLE_CONFIGS.small.size,
  bottleCost: BOTTLE_CONFIGS.small.cost,
  co2PerBottle: BOTTLE_CONFIGS.small.co2,
  plasticPerBottle: BOTTLE_CONFIGS.small.plastic,
  dailyIntake: DEFAULT_DAILY_INTAKE,
  userType: 'home'
};

export function useImpactCalculations(
  period: "day" | "month" | "year" | "all-time" = "year", 
  config: Partial<ImpactConfig> = {}
) {
  // Merge default config with provided config
  const fullConfig: ImpactConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Multipliers based on selected period
  const periodMultiplier = useMemo(() => {
    switch (period) {
      case "day":
        return 1;
      case "month":
        return 30;
      case "year":
        return 365;
      case "all-time":
        return 365 * 2; // Assume 2 years by default for all-time
      default:
        return 1;
    }
  }, [period]);

  // Calculate base water consumption in liters
  const waterConsumedLiters = fullConfig.dailyIntake * periodMultiplier;
  
  // Calculate impact values
  const bottlesSaved = calculateBottlesSaved(waterConsumedLiters, fullConfig.bottleSize);
  const moneySaved = calculateMoneySaved(bottlesSaved, fullConfig.bottleCost);
  const co2Saved = calculateCO2Reduction(bottlesSaved, fullConfig.co2PerBottle);
  const plasticSaved = calculatePlasticReduction(bottlesSaved, fullConfig.plasticPerBottle);
  
  // Get environmental equivalents
  const equivalents = getEnvironmentalEquivalents(co2Saved, plasticSaved);
  
  // Generate impact details
  const impactDetails = useMemo(() => {
    const yearMultiplier = period === "year" ? 1 : period === "month" ? 12 : 365;
    
    const details = [
      { 
        label: "Plastic bottles saved", 
        value: `${formatMetricValue(bottlesSaved, 'bottles')} bottles` 
      },
      { 
        label: "Purified water consumed", 
        value: `${waterConsumedLiters.toLocaleString()} liters` 
      },
      { 
        label: "Plastic waste avoided", 
        value: `${formatMetricValue(plasticSaved, 'plastic')} kg` 
      },
      { 
        label: "CO₂ emissions reduced", 
        value: `${formatMetricValue(co2Saved, 'co2')} kg` 
      },
      { 
        label: "Estimated yearly impact", 
        value: `${formatMetricValue(bottlesSaved * yearMultiplier, 'bottles')} bottles` 
      },
      { 
        label: "5-Year environmental impact", 
        value: `${formatMetricValue(bottlesSaved * yearMultiplier * 5, 'bottles')} bottles` 
      },
      { 
        label: "Trees equivalent", 
        value: `${equivalents.treesEquivalent} trees` 
      },
      { 
        label: "Car kilometers equivalent", 
        value: `${equivalents.carKilometers} km` 
      },
      { 
        label: "Smartphone charges equivalent", 
        value: `${equivalents.smartphoneCharges} charges` 
      },
      { 
        label: "Equivalent to recycling", 
        value: `${equivalents.recyclingEquivalent} kg of waste` 
      },
      { 
        label: "Water footprint reduced", 
        value: `${(waterConsumedLiters * 1.5).toFixed(0)} liters` 
      },
      { 
        label: "Energy saved", 
        value: `${(bottlesSaved * 2).toFixed(1)} kWh` 
      },
      { 
        label: "Money saved on bottled water", 
        value: `€${formatMetricValue(moneySaved, 'money')}` 
      }
    ];
    
    return details;
  }, [bottlesSaved, waterConsumedLiters, plasticSaved, co2Saved, period, moneySaved, equivalents]);

  return {
    impactDetails,
    bottlesSaved,
    waterSaved: waterConsumedLiters,
    moneySaved,
    plasticSaved,
    co2Saved,
    equivalents,
    config: fullConfig
  };
}
