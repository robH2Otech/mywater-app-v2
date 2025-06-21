
import { useState, useEffect, useMemo } from "react";
import { useImpactCalculations } from "@/hooks/dashboard/useImpactCalculations";
import { useUnits } from "@/hooks/useUnits";
import { useRealTimeCounters } from "./useRealTimeCounters";
import {
  calculateEnvironmentalBreakdown,
  calculateSeasonalTrends,
  calculateLocationImpacts,
  calculateAchievements,
  calculatePredictiveMetrics,
  getEnergyBreakdown,
  getEfficiencyTrends
} from "./calculations";

export function useEnhancedBusinessImpact(period: "day" | "month" | "year" | "all-time" = "year") {
  const [isLoading, setIsLoading] = useState(true);
  const { data: units = [], isLoading: unitsLoading } = useUnits();
  const { bottlesSaved, co2Saved, plasticSaved, waterSaved, energySaved, waterWastePrevented, equivalents } = useImpactCalculations(period);
  const realTimeCounters = useRealTimeCounters();
  
  // Environmental impact breakdown for pie charts
  const environmentalBreakdown = useMemo(() => 
    calculateEnvironmentalBreakdown(plasticSaved, co2Saved, energySaved, waterWastePrevented),
    [plasticSaved, co2Saved, energySaved, waterWastePrevented]
  );

  // Seasonal trends data
  const seasonalTrends = useMemo(() => 
    calculateSeasonalTrends(bottlesSaved, co2Saved, energySaved),
    [bottlesSaved, co2Saved, energySaved]
  );

  // Location-based impact data
  const locationImpacts = useMemo(() => 
    calculateLocationImpacts(bottlesSaved, co2Saved),
    [bottlesSaved, co2Saved]
  );

  // Achievement system
  const achievements = useMemo(() => 
    calculateAchievements(bottlesSaved, co2Saved, energySaved, period),
    [bottlesSaved, co2Saved, energySaved, period]
  );

  // Predictive analytics
  const predictiveMetrics = useMemo(() => 
    calculatePredictiveMetrics(bottlesSaved, co2Saved, period),
    [bottlesSaved, co2Saved, period]
  );

  // Energy consumption breakdown
  const energyBreakdown = useMemo(() => getEnergyBreakdown(), []);

  // Efficiency metrics over time
  const efficiencyTrends = useMemo(() => getEfficiencyTrends(), []);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [period]);

  return {
    isLoading: isLoading || unitsLoading,
    // Original data
    impactData: {
      bottlesSaved,
      co2Saved,
      plasticSaved,
      waterSaved,
      energySaved,
      waterWastePrevented,
      equivalents
    },
    // Enhanced data
    environmentalBreakdown,
    seasonalTrends,
    locationImpacts,
    achievements,
    predictiveMetrics,
    realTimeCounters,
    energyBreakdown,
    efficiencyTrends
  };
}
