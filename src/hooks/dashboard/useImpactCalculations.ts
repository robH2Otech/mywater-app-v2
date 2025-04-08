
import { useMemo, useState } from "react";
import { 
  BOTTLE_CONFIGS, 
  DEFAULT_DAILY_INTAKE,
  calculateBottlesSaved,
  calculateMoneySaved,
  calculateCO2Reduction,
  calculatePlasticReduction,
  getEnvironmentalEquivalents
} from "@/utils/formatUnitVolume";

export interface ImpactConfig {
  bottleSize: number;  // Size in liters (0.5, 1.0, 1.5)
  bottleCost: number;  // Cost in EUR
  co2PerBottle: number; // CO2 in grams per bottle
  plasticPerBottle: number; // Plastic in grams per bottle
  dailyIntake: number; // Daily water intake goal in liters
  userType: 'home' | 'business'; // User type affects which metrics are shown
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
      { label: "Plastic bottles saved", value: `${bottlesSaved.toLocaleString()} bottles` },
      { label: "Purified water consumed", value: `${waterConsumedLiters.toLocaleString()} liters` },
      { label: "Plastic waste avoided", value: `${plasticSaved.toFixed(1)} kg` },
      { label: "CO₂ emissions reduced", value: `${co2Saved.toFixed(1)} kg` },
      { label: "Estimated yearly impact", value: `${(bottlesSaved * yearMultiplier).toLocaleString()} bottles` },
      { label: "5-Year environmental impact", value: `${(bottlesSaved * yearMultiplier * 5).toLocaleString()} bottles` },
      { label: "Trees equivalent", value: `${equivalents.treesEquivalent} trees` },
      { label: "Car kilometers equivalent", value: `${equivalents.carKilometers} km` },
      { label: "Smartphone charges equivalent", value: `${equivalents.smartphoneCharges} charges` },
      { label: "Equivalent to recycling", value: `${equivalents.recyclingEquivalent} kg of waste` },
      { label: "Water footprint reduced", value: `${(waterConsumedLiters * 1.5).toFixed(0)} liters` },
      { label: "Energy saved", value: `${(bottlesSaved * 2).toFixed(1)} kWh` }
    ];
    
    // Add money-related details only for home users
    if (fullConfig.userType === 'home') {
      details.unshift({ 
        label: "Money saved on bottled water", 
        value: `€${moneySaved.toFixed(2)}` 
      });
    }
    
    return details;
  }, [bottlesSaved, waterConsumedLiters, plasticSaved, co2Saved, period, moneySaved, fullConfig.userType, equivalents]);

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
