
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Leaf, BarChart, Clock, Settings, Activity, TrendingUp } from "lucide-react";
import { BusinessImpactMetrics } from "./BusinessImpactMetrics";
import { DowntimeOverview } from "./DowntimeOverview";
import { EnvironmentalKPIs } from "./EnvironmentalKPIs";
import { PeriodToggle } from "../dashboard/private/calculator/PeriodToggle";
import { RealTimeDashboard } from "./dashboard/RealTimeDashboard";
import { PieChartCard } from "./charts/PieChartCard";
import { RadialProgressChart } from "./charts/RadialProgressChart";
import { useEnhancedBusinessImpact } from "@/hooks/impact/useEnhancedBusinessImpact";
import { motion } from "framer-motion";

export function BusinessImpactTabs() {
  const [activePeriod, setActivePeriod] = useState<"day" | "month" | "year" | "all-time">("year");
  const { 
    isLoading, 
    environmentalBreakdown, 
    achievements, 
    realTimeCounters, 
    energyBreakdown,
    seasonalTrends
  } = useEnhancedBusinessImpact(activePeriod);
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="realtime" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-gradient-to-br from-spotify-darker to-spotify-dark border border-mywater-accent/20 rounded-lg p-1 h-auto">
          <TabsTrigger
            value="realtime"
            className="flex items-center gap-2 py-3 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-mywater-accent/20 data-[state=active]:to-mywater-secondary/20 data-[state=active]:shadow-lg transition-all duration-300 text-white hover:bg-mywater-accent/10"
          >
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Live</span>
            <span className="sm:hidden">Live</span>
          </TabsTrigger>
          
          <TabsTrigger
            value="environment"
            className="flex items-center gap-2 py-3 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-mywater-accent/20 data-[state=active]:to-mywater-secondary/20 data-[state=active]:shadow-lg transition-all duration-300 text-white hover:bg-mywater-accent/10"
          >
            <Leaf className="h-4 w-4" />
            <span className="hidden sm:inline">Environment</span>
            <span className="sm:hidden">Env</span>
          </TabsTrigger>
          
          <TabsTrigger
            value="operational"
            className="flex items-center gap-2 py-3 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-mywater-accent/20 data-[state=active]:to-mywater-secondary/20 data-[state=active]:shadow-lg transition-all duration-300 text-white hover:bg-mywater-accent/10"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Operational</span>
            <span className="sm:hidden">Ops</span>
          </TabsTrigger>
          
          <TabsTrigger
            value="analytics"
            className="flex items-center gap-2 py-3 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-mywater-accent/20 data-[state=active]:to-mywater-secondary/20 data-[state=active]:shadow-lg transition-all duration-300 text-white hover:bg-mywater-accent/10"
          >
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          
          <TabsTrigger
            value="insights"
            className="flex items-center gap-2 py-3 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-mywater-accent/20 data-[state=active]:to-mywater-secondary/20 data-[state=active]:shadow-lg transition-all duration-300 text-white hover:bg-mywater-accent/10"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Insights</span>
            <span className="sm:hidden">Insights</span>
          </TabsTrigger>
          
          <TabsTrigger
            value="kpis"
            className="flex items-center gap-2 py-3 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-mywater-accent/20 data-[state=active]:to-mywater-secondary/20 data-[state=active]:shadow-lg transition-all duration-300 text-white hover:bg-mywater-accent/10"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">KPIs</span>
            <span className="sm:hidden">KPIs</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="realtime" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Real-Time Impact Dashboard</h3>
            </div>
            {!isLoading && (
              <RealTimeDashboard realTimeCounters={realTimeCounters} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Environmental Insights</h3>
              <PeriodToggle period={activePeriod} setPeriod={setActivePeriod} />
            </div>
            
            {!isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <PieChartCard
                  title="Environmental Impact Breakdown"
                  description="Distribution of environmental benefits"
                  data={environmentalBreakdown.map(item => ({
                    name: item.category,
                    value: item.value,
                    color: item.color,
                    percentage: item.percentage
                  }))}
                />
                
                <PieChartCard
                  title="Energy Savings Distribution"
                  description="Sources of energy conservation"
                  data={energyBreakdown}
                  innerRadius={40}
                  outerRadius={80}
                />
                
                <div className="lg:col-span-2">
                  <RadialProgressChart achievements={achievements} />
                </div>
              </motion.div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="environment" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Environmental Impact</h3>
              <PeriodToggle period={activePeriod} setPeriod={setActivePeriod} />
            </div>
            <EnvironmentalKPIs period={activePeriod} />
          </div>
        </TabsContent>
        
        <TabsContent value="operational" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Operational Overview</h3>
              <PeriodToggle period={activePeriod} setPeriod={setActivePeriod} />
            </div>
            <DowntimeOverview period={activePeriod} />
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Business Analytics</h3>
              <PeriodToggle period={activePeriod} setPeriod={setActivePeriod} />
            </div>
            <BusinessImpactMetrics period={activePeriod} />
          </div>
        </TabsContent>
        
        <TabsContent value="kpis" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Extended KPIs</h3>
              <PeriodToggle period={activePeriod} setPeriod={setActivePeriod} />
            </div>
            <EnvironmentalKPIs period={activePeriod} showExtended />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
