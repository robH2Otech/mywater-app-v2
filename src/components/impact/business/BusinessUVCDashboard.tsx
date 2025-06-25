
import React, { useState } from "react";
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

interface BusinessUVCDashboardProps {
  period: "day" | "month" | "year" | "all-time";
}

export function BusinessUVCDashboard({ period }: BusinessUVCDashboardProps) {
  const [selectedLocation, setSelectedLocation] = useState("all");
  
  // Mock data based on period - in real app this would come from props/hooks
  const getPeriodMultiplier = () => {
    switch (period) {
      case "day": return 1;
      case "month": return 30;
      case "year": return 365;
      case "all-time": return 730; // 2 years
      default: return 30;
    }
  };
  
  const baseWaterProcessed = 75; // m³ per day baseline
  const totalWaterProcessed = baseWaterProcessed * getPeriodMultiplier();
  
  // Calculate business metrics
  const businessMetrics = calculateBusinessUVCMetrics(totalWaterProcessed, {
    flowRate: UVC_CONSTANTS.TYPICAL_FLOW_RATES.medium,
    operatingHours: 16,
    daysInPeriod: getPeriodMultiplier()
  });
  
  const costSavings = calculateCostSavings(businessMetrics);
  
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-900/30 via-cyan-900/30 to-teal-900/30 border border-blue-500/40 rounded-lg p-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Factory className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Business UVC System Performance</h2>
            <p className="text-blue-200">Professional water purification metrics and efficiency tracking</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{businessMetrics.waterProcessed.toFixed(1)}</div>
            <div className="text-sm text-blue-300">m³ Processed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{businessMetrics.systemUptime.toFixed(1)}%</div>
            <div className="text-sm text-green-300">System Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">€{costSavings.totalCostSavings.toFixed(0)}</div>
            <div className="text-sm text-yellow-300">Cost Savings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{businessMetrics.maintenanceEfficiency.toFixed(1)}%</div>
            <div className="text-sm text-purple-300">Efficiency</div>
          </div>
        </div>
      </motion.div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-spotify-darker to-spotify-dark border border-mywater-accent/20 h-auto p-1">
          <TabsTrigger value="overview" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="efficiency" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Efficiency</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500/20 data-[state=active]:to-amber-500/20">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Maintenance</span>
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Locations</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-blue-500/20">
            <Droplets className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            <UVCMetricsCards 
              businessMetrics={businessMetrics}
              costSavings={costSavings}
              period={period}
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
