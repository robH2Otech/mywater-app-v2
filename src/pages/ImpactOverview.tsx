
import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { BusinessImpactTabs } from "@/components/impact/BusinessImpactTabs";
import { Card } from "@/components/ui/card";
import { Leaf, Download, Info, TrendingUp, Activity, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EnvironmentalKPIs } from "@/components/impact/EnvironmentalKPIs";
import { motion } from "framer-motion";
import { useEnhancedBusinessImpact } from "@/hooks/impact/useEnhancedBusinessImpact";
import { AnimatedCounterCard } from "@/components/impact/charts/AnimatedCounterCard";
import { Droplets, Zap } from "lucide-react";

const ImpactOverview = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState<"day" | "month" | "year" | "all-time">("year");
  const { impactData, realTimeCounters } = useEnhancedBusinessImpact(period);
  
  // Mock function for downloading reports
  const handleDownloadReport = () => {
    setIsLoading(true);
    // Simulate download process
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <PageHeader
          title="Environmental Impact Analytics"
          description="Comprehensive real-time environmental impact tracking with advanced analytics, predictive insights, and detailed performance metrics across your MYWATER ecosystem."
          icon={Leaf}
        />
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-green-500/10 border-green-500 text-green-400 hover:bg-green-500 hover:text-white transition-all duration-300" 
          >
            <Activity className="h-4 w-4" />
            <span>Live Dashboard</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-mywater-blue/10 border-mywater-blue text-mywater-blue hover:bg-mywater-blue hover:text-white transition-all duration-300" 
            onClick={handleDownloadReport}
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
            <span>{isLoading ? "Generating..." : "Export Report"}</span>
          </Button>
        </div>
      </div>

      {/* Real-time Impact Overview */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Card className="bg-gradient-to-r from-green-900/30 via-emerald-900/30 to-teal-900/30 border-green-500/40 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-30"></div>
            </div>
            <h2 className="text-xl font-bold text-white">Live Environmental Impact Today</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnimatedCounterCard
              title="Bottles Saved"
              value={realTimeCounters.bottlesToday}
              unit="bottles"
              icon={Droplets}
              iconColor="text-blue-400"
            />
            
            <AnimatedCounterCard
              title="CO₂ Reduced"
              value={realTimeCounters.co2Today}
              unit="kg"
              icon={Leaf}
              iconColor="text-green-400"
            />
            
            <AnimatedCounterCard
              title="Energy Saved"
              value={realTimeCounters.energyToday}
              unit="kWh"
              icon={Zap}
              iconColor="text-yellow-400"
            />
          </div>
        </Card>
      </motion.div>
      
      {/* Scientific Information */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="bg-gradient-to-r from-blue-900/20 via-blue-800/20 to-cyan-900/20 border border-blue-500/30 rounded-lg p-6 backdrop-blur-sm"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Info className="h-6 w-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-100 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Scientific Data-Based Environmental Calculations
            </h3>
            <p className="text-blue-200/90 text-sm leading-relaxed mb-3">
              All environmental impact calculations are based on peer-reviewed scientific research, lifecycle assessments, and industry standards:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-300/80">
              <div>• CO₂: 321g per liter of bottled water (full lifecycle)</div>
              <div>• Plastic: 40g per liter bottle (including cap & label)</div>
              <div>• Energy: 1.55 kWh per liter production & transport</div>
              <div>• Water waste: 2.33L per liter produced (source + process)</div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-300/60">
              <Target className="h-3 w-3" />
              <span>Data updated in real-time based on actual system usage</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      <Separator className="bg-spotify-accent/20" />
      
      {/* Enhanced Analytics Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-br from-spotify-darker via-slate-900/50 to-spotify-darker border-spotify-accent/30 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-mywater-blue to-cyan-400 bg-clip-text text-transparent">
              Advanced Environmental Analytics
            </h2>
            <p className="text-gray-400">
              Comprehensive environmental impact analysis with real-time data, predictive insights, and interactive visualizations
            </p>
          </div>
          
          <BusinessImpactTabs />
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ImpactOverview;
