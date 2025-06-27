
import React, { useState, useMemo } from "react";
import { Tabs } from "@/components/ui/tabs";
import { calculateBusinessUVCMetrics, calculateCostSavings, UVC_CONSTANTS } from "@/utils/businessUvcCalculations";
import { useUnits } from "@/hooks/useUnits";
import { DashboardTabNavigation } from "./DashboardTabNavigation";
import { DashboardLoadingState } from "./DashboardLoadingState";
import { DashboardContent } from "./DashboardContent";

interface BusinessUVCDashboardProps {
  period: "day" | "month" | "year" | "all-time";
}

export function BusinessUVCDashboard({ period }: BusinessUVCDashboardProps) {
  const [selectedLocation, setSelectedLocation] = useState("all");
  const { data: units = [], isLoading: unitsLoading } = useUnits();
  
  // Calculate real total water volume from all units
  const realTotalVolume = useMemo(() => {
    return units.reduce((total, unit) => {
      const unitVolume = Number(unit.total_volume) || 0;
      return total + unitVolume;
    }, 0);
  }, [units]);

  // Apply period filtering to the real volume
  const getPeriodAdjustedVolume = () => {
    if (realTotalVolume === 0) return 0;
    
    // For real data, we assume the total_volume represents cumulative data
    // We'll scale it based on the selected period for realistic representation
    switch (period) {
      case "day":
        // Show daily average (assuming total is over ~1 year)
        return realTotalVolume / 365;
      case "month":
        // Show monthly average
        return realTotalVolume / 12;
      case "year":
        // Show the actual total volume
        return realTotalVolume;
      case "all-time":
        // Show total volume (could be over multiple years)
        return realTotalVolume;
      default:
        return realTotalVolume;
    }
  };
  
  const adjustedWaterProcessed = getPeriodAdjustedVolume();
  
  // Calculate business metrics using real data
  const businessMetrics = useMemo(() => {
    return calculateBusinessUVCMetrics(adjustedWaterProcessed, {
      flowRate: UVC_CONSTANTS.TYPICAL_FLOW_RATES.medium,
      operatingHours: 16,
      daysInPeriod: period === "day" ? 1 : period === "month" ? 30 : period === "year" ? 365 : 730
    });
  }, [adjustedWaterProcessed, period]);
  
  const costSavings = useMemo(() => {
    return calculateCostSavings(businessMetrics);
  }, [businessMetrics]);

  // Show loading state while fetching real data
  if (unitsLoading) {
    return <DashboardLoadingState />;
  }
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <DashboardTabNavigation />
        <DashboardContent
          businessMetrics={businessMetrics}
          costSavings={costSavings}
          period={period}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          realDataAvailable={realTotalVolume > 0}
        />
      </Tabs>
    </div>
  );
}
