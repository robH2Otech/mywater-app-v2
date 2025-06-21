
import { useState, useEffect, useMemo } from "react";
import { useImpactCalculations } from "@/hooks/dashboard/useImpactCalculations";
import { useUnits } from "@/hooks/useUnits";

interface EnvironmentalBreakdown {
  category: string;
  value: number;
  color: string;
  percentage: number;
}

interface SeasonalTrend {
  month: string;
  bottles: number;
  co2: number;
  energy: number;
  cost: number;
}

interface LocationImpact {
  location: string;
  bottles: number;
  co2: number;
  efficiency: number;
  lat: number;
  lng: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  unlocked: boolean;
  icon: string;
}

interface PredictiveMetrics {
  nextYear: {
    bottles: number;
    co2: number;
    cost: number;
  };
  trend: 'increasing' | 'stable' | 'decreasing';
  confidence: number;
}

export function useEnhancedBusinessImpact(period: "day" | "month" | "year" | "all-time" = "year") {
  const [isLoading, setIsLoading] = useState(true);
  const { data: units = [], isLoading: unitsLoading } = useUnits();
  const { bottlesSaved, co2Saved, plasticSaved, waterSaved, energySaved, waterWastePrevented, equivalents } = useImpactCalculations(period);
  
  // Environmental impact breakdown for pie charts
  const environmentalBreakdown: EnvironmentalBreakdown[] = useMemo(() => [
    { category: "Plastic Reduction", value: plasticSaved * 0.35, color: "#10b981", percentage: 35 },
    { category: "CO₂ Reduction", value: co2Saved * 0.28, color: "#3b82f6", percentage: 28 },
    { category: "Energy Savings", value: energySaved * 0.22, color: "#f59e0b", percentage: 22 },
    { category: "Water Conservation", value: waterWastePrevented * 0.15, color: "#06b6d4", percentage: 15 }
  ], [plasticSaved, co2Saved, energySaved, waterWastePrevented]);

  // Seasonal trends data
  const seasonalTrends: SeasonalTrend[] = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month, index) => {
      const seasonalMultiplier = 0.8 + Math.sin((index / 12) * Math.PI * 2) * 0.3;
      return {
        month,
        bottles: Math.round(bottlesSaved * seasonalMultiplier * 30),
        co2: Math.round(co2Saved * seasonalMultiplier * 30 * 10) / 10,
        energy: Math.round(energySaved * seasonalMultiplier * 30 * 10) / 10,
        cost: Math.round(bottlesSaved * seasonalMultiplier * 30 * 1.2 * 100) / 100
      };
    });
  }, [bottlesSaved, co2Saved, energySaved]);

  // Location-based impact data
  const locationImpacts: LocationImpact[] = useMemo(() => [
    { location: "Headquarters", bottles: bottlesSaved * 0.4, co2: co2Saved * 0.4, efficiency: 94, lat: 52.3676, lng: 4.9041 },
    { location: "Branch Office A", bottles: bottlesSaved * 0.25, co2: co2Saved * 0.25, efficiency: 89, lat: 52.3702, lng: 4.8952 },
    { location: "Branch Office B", bottles: bottlesSaved * 0.2, co2: co2Saved * 0.2, efficiency: 91, lat: 52.3588, lng: 4.9136 },
    { location: "Data Center", bottles: bottlesSaved * 0.15, co2: co2Saved * 0.15, efficiency: 97, lat: 52.3625, lng: 4.9200 }
  ], [bottlesSaved, co2Saved]);

  // Achievement system
  const achievements: Achievement[] = useMemo(() => [
    {
      id: "bottles-1000",
      title: "Bottle Saver",
      description: "Save 1,000 plastic bottles",
      progress: Math.min(bottlesSaved, 1000),
      target: 1000,
      unlocked: bottlesSaved >= 1000,
      icon: "🏆"
    },
    {
      id: "co2-100kg",
      title: "Carbon Reducer",
      description: "Prevent 100kg of CO₂ emissions",
      progress: Math.min(co2Saved, 100),
      target: 100,
      unlocked: co2Saved >= 100,
      icon: "🌱"
    },
    {
      id: "energy-500kwh",
      title: "Energy Saver",
      description: "Save 500 kWh of energy",
      progress: Math.min(energySaved, 500),
      target: 500,
      unlocked: energySaved >= 500,
      icon: "⚡"
    },
    {
      id: "year-milestone",
      title: "Year of Impact",
      description: "Complete one full year of environmental impact",
      progress: period === "year" ? 365 : period === "month" ? 30 : 1,
      target: 365,
      unlocked: period === "year",
      icon: "🎯"
    }
  ], [bottlesSaved, co2Saved, energySaved, period]);

  // Predictive analytics
  const predictiveMetrics: PredictiveMetrics = useMemo(() => {
    const yearlyMultiplier = period === "year" ? 1 : period === "month" ? 12 : 365;
    const growthRate = 1.15; // 15% projected growth
    
    return {
      nextYear: {
        bottles: Math.round(bottlesSaved * yearlyMultiplier * growthRate),
        co2: Math.round(co2Saved * yearlyMultiplier * growthRate * 10) / 10,
        cost: Math.round(bottlesSaved * yearlyMultiplier * growthRate * 1.2 * 100) / 100
      },
      trend: 'increasing',
      confidence: 85
    };
  }, [bottlesSaved, co2Saved, period]);

  // Real-time counters (animated values)
  const [realTimeCounters, setRealTimeCounters] = useState({
    bottlesToday: 0,
    co2Today: 0,
    energyToday: 0
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeCounters(prev => ({
        bottlesToday: prev.bottlesToday + Math.floor(Math.random() * 3),
        co2Today: prev.co2Today + Math.random() * 0.1,
        energyToday: prev.energyToday + Math.random() * 0.05
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Energy consumption breakdown - now with percentage property
  const energyBreakdown = useMemo(() => [
    { name: "Production Savings", value: 45, color: "#10b981", percentage: 45 },
    { name: "Transportation Avoided", value: 30, color: "#3b82f6", percentage: 30 },
    { name: "Packaging Eliminated", value: 15, color: "#f59e0b", percentage: 15 },
    { name: "Recycling Prevented", value: 10, color: "#ef4444", percentage: 10 }
  ], []);

  // Efficiency metrics over time
  const efficiencyTrends = useMemo(() => {
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
    return weeks.map(week => ({
      name: week,
      efficiency: 85 + Math.random() * 15,
      target: 95,
      actual: 80 + Math.random() * 20
    }));
  }, []);

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
