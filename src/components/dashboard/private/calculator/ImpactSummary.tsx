
import { useMemo } from "react";
import { calculateBottlesSaved, calculateMoneySaved, calculateCO2Reduction, calculatePlasticReduction } from "@/utils/formatUnitVolume";
import { ImpactMetrics } from "./ImpactMetrics";
import { ImpactAchievements } from "./ImpactAchievements";

interface ImpactSummaryProps {
  period: "day" | "month" | "year" | "all-time";
  config: {
    bottleSize: number;
    bottleCost: number;
    dailyIntake: number;
  };
}

export function ImpactSummary({ period, config }: ImpactSummaryProps) {
  // Calculate period multiplier
  const periodMultiplier = useMemo(() => {
    switch (period) {
      case "day": return 1;
      case "month": return 30;
      case "year": return 365;
      case "all-time": return 365 * 2; // Assume 2 years for all-time
      default: return 1;
    }
  }, [period]);

  // Calculate base water consumption
  const waterConsumedLiters = config.dailyIntake * periodMultiplier;
  
  // Calculate metrics - only pass liters consumed
  const bottlesSaved = calculateBottlesSaved(waterConsumedLiters, config.bottleSize);
  const moneySaved = calculateMoneySaved(bottlesSaved, config.bottleCost);
  const co2Saved = calculateCO2Reduction(waterConsumedLiters);
  const plasticSaved = calculatePlasticReduction(waterConsumedLiters);

  return (
    <div className="space-y-6">
      <div className="text-center text-gray-400 mb-2">
        <p>Using MYWATER instead of plastic bottles has already saved:</p>
        <p className="text-xs text-gray-500 mt-1">
          Based on {config.bottleSize}L bottles at €{config.bottleCost.toFixed(2)} each
        </p>
      </div>
      
      <ImpactMetrics 
        bottlesSaved={bottlesSaved}
        moneySaved={moneySaved}
        co2Saved={co2Saved}
        plasticSaved={plasticSaved}
      />
      
      <ImpactAchievements bottlesSaved={bottlesSaved} />
    </div>
  );
}
