
import { useMemo } from "react";

export function useImpactCalculations(period: "day" | "month" | "year") {
  // Constants for calculations
  const BASE_BOTTLES_SAVED_PER_DAY = 2;
  const LITERS_PER_BOTTLE = 1.5;
  const PLASTIC_GRAMS_PER_BOTTLE = 30;
  const CO2_GRAMS_PER_BOTTLE = 80;

  // Multipliers based on selected period
  const periodMultiplier = useMemo(() => {
    switch (period) {
      case "day":
        return 1;
      case "month":
        return 30;
      case "year":
        return 365;
      default:
        return 1;
    }
  }, [period]);

  // Calculate impact values
  const bottlesSaved = BASE_BOTTLES_SAVED_PER_DAY * periodMultiplier;
  const waterSaved = bottlesSaved * LITERS_PER_BOTTLE;
  const plasticSaved = (bottlesSaved * PLASTIC_GRAMS_PER_BOTTLE) / 1000; // kg
  const co2Saved = (bottlesSaved * CO2_GRAMS_PER_BOTTLE) / 1000; // kg

  // Generate impact details
  const impactDetails = useMemo(() => {
    const yearMultiplier = period === "year" ? 1 : period === "month" ? 12 : 365;
    
    return [
      { label: "Plastic bottles saved", value: `${bottlesSaved.toLocaleString()} bottles` },
      { label: "Purified water consumed", value: `${waterSaved.toLocaleString()} liters` },
      { label: "Plastic waste avoided", value: `${plasticSaved.toFixed(1)} kg` },
      { label: "CO₂ emissions reduced", value: `${co2Saved.toFixed(1)} kg` },
      { label: "Estimated yearly impact", value: `${(bottlesSaved * yearMultiplier).toLocaleString()} bottles` },
      { label: "5-Year environmental impact", value: `${(bottlesSaved * yearMultiplier * 5).toLocaleString()} bottles` },
      { label: "Trees equivalent", value: `${(co2Saved / 21).toFixed(2)} trees` },
      { label: "Car kilometers equivalent", value: `${(co2Saved * 6).toFixed(0)} km` },
      { label: "Smartphone charges equivalent", value: `${(co2Saved * 10).toFixed(0)} charges` },
      { label: "Equivalent to recycling", value: `${(plasticSaved * 2).toFixed(1)} kg of waste` },
      { label: "Water footprint reduced", value: `${(waterSaved * 1.5).toFixed(0)} liters` },
      { label: "Energy saved", value: `${(bottlesSaved * 2).toFixed(1)} kWh` }
    ];
  }, [bottlesSaved, waterSaved, plasticSaved, co2Saved, period]);

  return {
    impactDetails,
    bottlesSaved,
    waterSaved,
    plasticSaved,
    co2Saved
  };
}
