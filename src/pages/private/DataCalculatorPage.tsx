
import { ImpactCalculatorContent } from "@/components/dashboard/private/impact/ImpactCalculatorContent";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PredictiveMaintenanceDashboard } from "@/components/analytics/predictive/PredictiveMaintenanceDashboard"; 

export function DataCalculatorPage() {
  const [period, setPeriod] = useState<"day" | "month" | "year" | "all-time">("month");
  const [config, setConfig] = useState({
    bottleSize: 0.5,
    bottleCost: 1.10,
    userType: "home" as const
  });
  const [activeTab, setActiveTab] = useState<"impact" | "predictive">("impact");

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "impact" | "predictive")}>
          <TabsList className="mb-6">
            <TabsTrigger value="impact">Environmental Impact</TabsTrigger>
            <TabsTrigger value="predictive">Predictive Maintenance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="impact" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-cyan-600/30 rounded-xl p-4 shadow-xl">
              <ImpactCalculatorContent 
                period={period}
                setPeriod={setPeriod}
                config={config}
                onConfigChange={(newConfig) => setConfig(prev => ({ ...prev, ...newConfig }))}
                userName=""
              />
            </div>
          </TabsContent>
          
          <TabsContent value="predictive" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="bg-gradient-to-br from-violet-900/20 to-indigo-900/20 border-indigo-600/30 rounded-xl p-4 shadow-xl">
              <PredictiveMaintenanceDashboard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
