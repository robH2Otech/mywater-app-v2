
import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { BusinessUVCDashboard } from "@/components/impact/business/BusinessUVCDashboard";
import { Card } from "@/components/ui/card";
import { Factory, Download, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { LiveSystemStatusDialog } from "@/components/impact/business/LiveSystemStatusDialog";
import { ESGReportDialog } from "@/components/impact/business/ESGReportDialog";

const ImpactOverview = () => {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<"day" | "month" | "year" | "all-time">("year");
  const [showSystemStatus, setShowSystemStatus] = useState(false);
  const [showESGReport, setShowESGReport] = useState(false);

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
            onClick={() => setShowSystemStatus(true)}
          >
            <Activity className="h-4 w-4" />
            <span>{t("business.uvc.live.system.status")}</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-mywater-blue/10 border-mywater-blue text-mywater-blue hover:bg-mywater-blue hover:text-white transition-all duration-300" 
            onClick={() => setShowESGReport(true)}
          >
            <Download className="h-4 w-4" />
            <span>{t("business.uvc.export.esg.report")}</span>
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
        <BusinessUVCDashboard period={period} />
      </motion.div>

      {/* Dialogs */}
      <LiveSystemStatusDialog 
        open={showSystemStatus} 
        onOpenChange={setShowSystemStatus} 
      />
      <ESGReportDialog 
        open={showESGReport} 
        onOpenChange={setShowESGReport}
        period={period}
      />
    </motion.div>
  );
};

export default ImpactOverview;
