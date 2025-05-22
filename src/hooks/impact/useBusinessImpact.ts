
import { useState, useEffect, useMemo } from "react";
import { useImpactCalculations } from "@/hooks/dashboard/useImpactCalculations";
import { useUnits } from "@/hooks/useUnits";
import { useQuery, useQueries } from "@tanstack/react-query";

interface BusinessImpactData {
  bottlesSaved: number;
  co2Saved: number;
  plasticSaved: number;
  waterSaved: number;
  equivalents: {
    treesEquivalent: number;
    carKilometers: number;
    smartphoneCharges: number;
    recyclingEquivalent: number;
  };
}

interface UnitStatusData {
  operational: number;
  maintenance: number;
  offline: number;
  total: number;
  uptime: number;
  needsAttention: {
    id: string;
    name: string;
    status: 'maintenance' | 'offline';
    lastActive: string;
  }[];
}

export function useBusinessImpact(period: "day" | "month" | "year" | "all-time" = "year") {
  const [isLoading, setIsLoading] = useState(true);
  const { units, isLoading: unitsLoading } = useUnits();
  const { bottlesSaved, co2Saved, plasticSaved, waterSaved, equivalents } = useImpactCalculations(period);
  
  // Mock data for the business impact metrics
  const totals: BusinessImpactData = useMemo(() => {
    const unitCount = units?.length || 1;
    const multiplier = unitCount * (period === "day" ? 1 : period === "month" ? 30 : period === "year" ? 365 : 730);
    
    return {
      bottlesSaved: bottlesSaved * multiplier,
      co2Saved: co2Saved * multiplier,
      plasticSaved: plasticSaved * multiplier,
      waterSaved: waterSaved * multiplier,
      equivalents: {
        treesEquivalent: Math.round(equivalents.treesEquivalent * multiplier),
        carKilometers: Math.round(equivalents.carKilometers * multiplier),
        smartphoneCharges: Math.round(equivalents.smartphoneCharges * multiplier),
        recyclingEquivalent: Math.round(equivalents.recyclingEquivalent * multiplier)
      }
    };
  }, [bottlesSaved, co2Saved, plasticSaved, waterSaved, equivalents, units, period]);
  
  // Mock data for environmental impact chart
  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
    return months.map(month => ({
      name: month,
      bottles: Math.round(Math.random() * 5000 + 1000),
      co2: Math.round((Math.random() * 500 + 100) * 10) / 10,
      plastic: Math.round((Math.random() * 200 + 50) * 10) / 10
    }));
  }, [period]);
  
  // Mock unit status data
  const unitStatus: UnitStatusData = useMemo(() => {
    const total = units?.length || 10;
    const operational = Math.round(total * 0.8);
    const maintenance = Math.round(total * 0.15);
    const offline = total - operational - maintenance;
    
    const mockNeedsAttention = [
      {
        id: "MYWATER_001",
        name: "Office Building A - Floor 3",
        status: 'maintenance' as const,
        lastActive: "2 days ago"
      },
      {
        id: "MYWATER_007",
        name: "Training Center - Reception",
        status: 'offline' as const,
        lastActive: "5 days ago"
      }
    ];
    
    return {
      operational,
      maintenance,
      offline,
      total,
      uptime: Math.round((operational / total) * 100),
      needsAttention: mockNeedsAttention
    };
  }, [units]);
  
  // Mock downtime incidents
  const downtimeData = useMemo(() => [
    {
      unitName: "MYWATER_007 - Training Center",
      issue: "Connectivity issue - Unable to reach device",
      duration: "5 days",
      date: "Oct 15, 2023"
    },
    {
      unitName: "MYWATER_001 - Office Building A",
      issue: "Maintenance required - Filter change needed",
      duration: "2 days",
      date: "Oct 18, 2023"
    },
    {
      unitName: "MYWATER_012 - Conference Room",
      issue: "Low water pressure detected",
      duration: "3 hours",
      date: "Oct 20, 2023"
    }
  ], []);
  
  // Mock performance data for charts
  const performanceData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map(month => ({
      name: month,
      performance: Math.round(Math.random() * 20 + 80),
      target: 95
    }));
  }, [period]);
  
  // Mock location data
  const locationData = useMemo(() => [
    { location: "HQ Building", efficiency: 94, impact: 87 },
    { location: "Branch Office", efficiency: 89, impact: 76 },
    { location: "Data Center", efficiency: 97, impact: 92 },
    { location: "Distribution", efficiency: 85, impact: 79 }
  ], []);
  
  // Mock units comparison
  const unitsComparison = useMemo(() => [
    { name: "MYWATER_005", value: 92 },
    { name: "MYWATER_002", value: 88 },
    { name: "MYWATER_009", value: 85 },
    { name: "MYWATER_001", value: 82 },
    { name: "MYWATER_007", value: 78 }
  ], []);
  
  // Simulate loading data
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [period]);
  
  // Return all the mock data for business impact metrics
  return {
    isLoading: isLoading || unitsLoading,
    impactData: totals,
    chartData,
    totals,
    unitStatus,
    downtimeData,
    performanceData,
    locationData,
    unitsComparison
  };
}
