
import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { BusinessUVCDashboard } from "@/components/impact/business/BusinessUVCDashboard";
import { Card } from "@/components/ui/card";
import { Factory, Download, Info, TrendingUp, Activity, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
          title="Business UVC Impact & Efficiency Dashboard"
          description="Comprehensive real-time UVC water purification system monitoring with operational KPIs, cost savings analysis, and performance metrics for professional installations."
          icon={Factory}
        />
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-green-500/10 border-green-500 text-green-400 hover:bg-green-500 hover:text-white transition-all duration-300" 
          >
            <Activity className="h-4 w-4" />
            <span>Live System Status</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-mywater-blue/10 border-mywater-blue text-mywater-blue hover:bg-mywater-blue hover:text-white transition-all duration-300" 
            onClick={handleDownloadReport}
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
            <span>{isLoading ? "Generating..." : "Export ESG Report"}</span>
          </Button>
        </div>
      </div>

      {/* Scientific Information for UVC Systems */}
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
              UVC Water Purification System Calculations
            </h3>
            <p className="text-blue-200/90 text-sm leading-relaxed mb-3">
              Professional-grade UVC water purification metrics based on industrial standards and operational efficiency:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-300/80">
              <div>• Flow Rate: 2-10 m³/hour (typical business systems)</div>
              <div>• Energy Efficiency: 1.55 kWh saved per m³ processed</div>
              <div>• Water Waste Prevention: 2.33 m³ per m³ purified</div>
              <div>• Cost Equivalence: €0.02 per m³ operational savings</div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-300/60">
              <Target className="h-3 w-3" />
              <span>Real-time system monitoring with predictive maintenance alerts</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      <Separator className="bg-spotify-accent/20" />
      
      {/* Business UVC Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-br from-spotify-darker via-slate-900/50 to-spotify-darker border-spotify-accent/30 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-mywater-blue to-cyan-400 bg-clip-text text-transparent">
              Professional UVC System Analytics
            </h2>
            <p className="text-gray-400">
              Comprehensive operational metrics, maintenance tracking, and business impact analysis for UVC water purification systems
            </p>
          </div>
          
          <BusinessUVCDashboard period={period} />
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ImpactOverview;
