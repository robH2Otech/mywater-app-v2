
import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { BusinessUVCDashboard } from "@/components/impact/business/BusinessUVCDashboard";
import { Card } from "@/components/ui/card";
import { Factory, Download, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const ImpactOverview = () => {
  const { t } = useLanguage();
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
          title={t("business.uvc.dashboard.title")}
          description={t("business.uvc.dashboard.description")}
          icon={Factory}
        />
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-green-500/10 border-green-500 text-green-400 hover:bg-green-500 hover:text-white transition-all duration-300" 
          >
            <Activity className="h-4 w-4" />
            <span>{t("business.uvc.live.system.status")}</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-mywater-blue/10 border-mywater-blue text-mywater-blue hover:bg-mywater-blue hover:text-white transition-all duration-300" 
            onClick={handleDownloadReport}
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
            <span>{isLoading ? t("business.uvc.generating") : t("business.uvc.export.esg.report")}</span>
          </Button>
        </div>
      </div>
      
      <Separator className="bg-spotify-accent/20" />
      
      {/* Business UVC Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-br from-spotify-darker via-slate-900/50 to-spotify-darker border-spotify-accent/30 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-mywater-blue to-cyan-400 bg-clip-text text-transparent">
              {t("business.uvc.professional.analytics")}
            </h2>
            <p className="text-gray-400">
              {t("business.uvc.comprehensive.metrics")}
            </p>
          </div>
          
          <BusinessUVCDashboard period={period} />
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ImpactOverview;
