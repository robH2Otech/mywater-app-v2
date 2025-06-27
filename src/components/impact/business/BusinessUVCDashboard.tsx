
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Factory, TrendingUp, Zap, Droplets, Building2, Activity } from "lucide-react";
import { UVCMetricsCards } from "./UVCMetricsCards";
import { SystemEfficiencyChart } from "./SystemEfficiencyChart";
import { MaintenanceTracker } from "./MaintenanceTracker";
import { MultiLocationComparison } from "./MultiLocationComparison";
import { ESGReportGenerator } from "./ESGReportGenerator";
import { calculateBusinessUVCMetrics, calculateCostSavings, UVC_CONSTANTS } from "@/utils/businessUvcCalculations";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUnits } from "@/hooks/useUnits";

interface BusinessUVCDashboardProps {
  period: "day" | "month" | "year" | "all-time";
}

export function BusinessUVCDashboard({ period }: BusinessUVCDashboardProps) {
  const { t } = useLanguage();
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
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gradient-to-r from-blue-900/20 via-cyan-900/20 to-teal-900/20 border border-blue-500/40 rounded-lg"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-96 bg-spotify-darker border border-spotify-accent/30 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-spotify-darker to-spotify-dark border border-mywater-accent/20 h-auto p-1">
          <TabsTrigger value="overview" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">{t("nav.dashboard")}</span>
          </TabsTrigger>
          <TabsTrigger value="efficiency" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">{t("business.uvc.efficiency")}</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500/20 data-[state=active]:to-amber-500/20">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">{t("nav.filters")}</span>
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t("nav.locations")}</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-blue-500/20">
            <Droplets className="h-4 w-4" />
            <span className="hidden sm:inline">{t("analytics.reports")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            <UVCMetricsCards 
              businessMetrics={businessMetrics}
              costSavings={costSavings}
              period={period}
              realDataAvailable={realTotalVolume > 0}
            />
            <SystemEfficiencyChart 
              metrics={businessMetrics}
              period={period}
            />
          </div>
        </TabsContent>

        <TabsContent value="efficiency" className="mt-6">
          <SystemEfficiencyChart 
            metrics={businessMetrics}
            period={period}
            detailed={true}
          />
        </TabsContent>

        <TabsContent value="maintenance" className="mt-6">
          <MaintenanceTracker 
            metrics={businessMetrics}
            period={period}
          />
        </TabsContent>

        <TabsContent value="locations" className="mt-6">
          <MultiLocationComparison 
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            period={period}
          />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <ESGReportGenerator 
            businessMetrics={businessMetrics}
            costSavings={costSavings}
            period={period}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
