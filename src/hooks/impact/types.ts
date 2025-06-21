
export interface EnvironmentalBreakdown {
  category: string;
  value: number;
  color: string;
  percentage: number;
}

export interface SeasonalTrend {
  month: string;
  bottles: number;
  co2: number;
  energy: number;
  cost: number;
}

export interface LocationImpact {
  location: string;
  bottles: number;
  co2: number;
  efficiency: number;
  lat: number;
  lng: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  unlocked: boolean;
  icon: string;
}

export interface PredictiveMetrics {
  nextYear: {
    bottles: number;
    co2: number;
    cost: number;
  };
  trend: 'increasing' | 'stable' | 'decreasing';
  confidence: number;
}

export interface RealTimeCounters {
  bottlesToday: number;
  co2Today: number;
  energyToday: number;
}

export interface EnergyBreakdown {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface EfficiencyTrend {
  name: string;
  efficiency: number;
  target: number;
  actual: number;
}
