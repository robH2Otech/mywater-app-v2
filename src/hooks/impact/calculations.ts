
import { EnvironmentalBreakdown, SeasonalTrend, LocationImpact, Achievement, PredictiveMetrics, EnergyBreakdown, EfficiencyTrend } from "./types";

export const calculateEnvironmentalBreakdown = (
  plasticSaved: number,
  co2Saved: number,
  energySaved: number,
  waterWastePrevented: number
): EnvironmentalBreakdown[] => [
  { category: "Plastic Reduction", value: plasticSaved * 0.35, color: "#10b981", percentage: 35 },
  { category: "CO₂ Reduction", value: co2Saved * 0.28, color: "#3b82f6", percentage: 28 },
  { category: "Energy Savings", value: energySaved * 0.22, color: "#f59e0b", percentage: 22 },
  { category: "Water Conservation", value: waterWastePrevented * 0.15, color: "#06b6d4", percentage: 15 }
];

export const calculateSeasonalTrends = (
  bottlesSaved: number,
  co2Saved: number,
  energySaved: number
): SeasonalTrend[] => {
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
};

export const calculateLocationImpacts = (
  bottlesSaved: number,
  co2Saved: number
): LocationImpact[] => [
  { location: "Headquarters", bottles: bottlesSaved * 0.4, co2: co2Saved * 0.4, efficiency: 94, lat: 52.3676, lng: 4.9041 },
  { location: "Branch Office A", bottles: bottlesSaved * 0.25, co2: co2Saved * 0.25, efficiency: 89, lat: 52.3702, lng: 4.8952 },
  { location: "Branch Office B", bottles: bottlesSaved * 0.2, co2: co2Saved * 0.2, efficiency: 91, lat: 52.3588, lng: 4.9136 },
  { location: "Data Center", bottles: bottlesSaved * 0.15, co2: co2Saved * 0.15, efficiency: 97, lat: 52.3625, lng: 4.9200 }
];

export const calculateAchievements = (
  bottlesSaved: number,
  co2Saved: number,
  energySaved: number,
  period: "day" | "month" | "year" | "all-time"
): Achievement[] => [
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
];

export const calculatePredictiveMetrics = (
  bottlesSaved: number,
  co2Saved: number,
  period: "day" | "month" | "year" | "all-time"
): PredictiveMetrics => {
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
};

export const getEnergyBreakdown = (): EnergyBreakdown[] => [
  { name: "Production Savings", value: 45, color: "#10b981", percentage: 45 },
  { name: "Transportation Avoided", value: 30, color: "#3b82f6", percentage: 30 },
  { name: "Packaging Eliminated", value: 15, color: "#f59e0b", percentage: 15 },
  { name: "Recycling Prevented", value: 10, color: "#ef4444", percentage: 10 }
];

export const getEfficiencyTrends = (): EfficiencyTrend[] => {
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
  return weeks.map(week => ({
    name: week,
    efficiency: 85 + Math.random() * 15,
    target: 95,
    actual: 80 + Math.random() * 20
  }));
};
