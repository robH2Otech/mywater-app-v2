
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Activity, Zap, Building2, Droplets } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function DashboardTabNavigation() {
  const { t } = useLanguage();

  return (
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
  );
}
