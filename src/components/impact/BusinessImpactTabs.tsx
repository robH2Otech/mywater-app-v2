
import React, { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Leaf, BarChart, Clock } from "lucide-react";
import { BusinessImpactMetrics } from "./BusinessImpactMetrics";
import { DowntimeOverview } from "./DowntimeOverview";
import { EnvironmentalKPIs } from "./EnvironmentalKPIs";
import { EnhancedTabs } from "@/components/ui/enhanced-tabs";
import { PeriodToggle } from "../dashboard/private/calculator/PeriodToggle";

export function BusinessImpactTabs() {
  const [activePeriod, setActivePeriod] = useState<"day" | "month" | "year" | "all-time">("year");
  
  const tabItems = [
    {
      value: "environment",
      label: "Environment",
      icon: <Leaf className="h-4 w-4" />
    },
    {
      value: "operational",
      label: "Operational",
      icon: <Clock className="h-4 w-4" />
    },
    {
      value: "analytics",
      label: "Analytics",
      icon: <BarChart className="h-4 w-4" />
    },
    {
      value: "kpis",
      label: "KPIs",
      icon: <BarChart className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <EnhancedTabs defaultValue="environment" items={tabItems}>
          <TabsContent value="environment" className="mt-6">
            <div className="mb-4">
              <PeriodToggle period={activePeriod} setPeriod={setActivePeriod} />
            </div>
            <EnvironmentalKPIs period={activePeriod} />
          </TabsContent>
          
          <TabsContent value="operational" className="mt-6">
            <div className="mb-4">
              <PeriodToggle period={activePeriod} setPeriod={setActivePeriod} />
            </div>
            <DowntimeOverview period={activePeriod} />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <div className="mb-4">
              <PeriodToggle period={activePeriod} setPeriod={setActivePeriod} />
            </div>
            <BusinessImpactMetrics period={activePeriod} />
          </TabsContent>
          
          <TabsContent value="kpis" className="mt-6">
            <div className="mb-4">
              <PeriodToggle period={activePeriod} setPeriod={setActivePeriod} />
            </div>
            <EnvironmentalKPIs period={activePeriod} showExtended />
          </TabsContent>
        </EnhancedTabs>
      </div>
    </div>
  );
}
