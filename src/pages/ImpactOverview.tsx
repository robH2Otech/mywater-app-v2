
import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { BusinessImpactTabs } from "@/components/impact/BusinessImpactTabs";
import { Card } from "@/components/ui/card";
import { Leaf, Download, Info, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EnvironmentalKPIs } from "@/components/impact/EnvironmentalKPIs";
import { motion } from "framer-motion";

const ImpactOverview = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState<"day" | "month" | "year" | "all-time">("year");
  
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
          title="Environmental Impact Dashboard"
          description="Track environmental impact and operational efficiency across your units with real-time data and scientific calculations."
          icon={Leaf}
        />
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
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-gradient-to-r from-blue-900/20 via-blue-800/20 to-cyan-900/20 border border-blue-500/30 rounded-lg p-6 backdrop-blur-sm"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Info className="h-6 w-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-100 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Scientific Data-Based Calculations
            </h3>
            <p className="text-blue-200/90 text-sm leading-relaxed">
              All environmental impact calculations are based on peer-reviewed scientific research and industry standards:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-xs text-blue-300/80">
              <div>• CO₂: 321g per liter of bottled water</div>
              <div>• Plastic: 40g per liter bottle</div>
              <div>• Energy: 1.55 kWh per liter production</div>
              <div>• Water waste: 2.33L per liter produced</div>
            </div>
          </div>
        </div>
      </motion.div>
      
      <Separator className="bg-spotify-accent/20" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-br from-spotify-darker via-slate-900/50 to-spotify-darker border-spotify-accent/30 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-mywater-blue to-cyan-400 bg-clip-text text-transparent">
              Real-Time Environmental Metrics
            </h2>
            <p className="text-gray-400">
              Live environmental impact data based on your MYWATER system usage and performance
            </p>
          </div>
          
          <EnvironmentalKPIs period={period} showExtended={true} />
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-br from-spotify-darker via-slate-900/50 to-spotify-darker border-spotify-accent/30 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Comprehensive Impact Analysis
            </h2>
            <p className="text-gray-400">
              Detailed breakdown of environmental, operational, and business metrics
            </p>
          </div>
          
          <BusinessImpactTabs />
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ImpactOverview;
