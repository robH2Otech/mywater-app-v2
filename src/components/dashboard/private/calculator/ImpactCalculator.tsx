
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImpactSummary } from "./ImpactSummary";
import { FinancialImpact } from "./FinancialImpact";
import { CO2Impact } from "./CO2Impact";
import { WaterConsumptionSettings } from "./WaterConsumptionSettings";
import { PeriodToggle } from "./PeriodToggle";
import { motion } from "framer-motion";

interface ImpactCalculatorProps {
  userName?: string;
}

export function ImpactCalculator({ userName }: ImpactCalculatorProps) {
  const [period, setPeriod] = useState<"week" | "month" | "year" | "all-time">("year");
  const [activeTab, setActiveTab] = useState("environment");
  const [config, setConfig] = useState({
    bottleSize: 0.5, // Default to 0.5L bottles
    bottleCost: 1.10, // Default to €1.10 per bottle
    dailyIntake: 2.0, // Default to 2L per day
  });

  const handleConfigChange = (newConfig: Partial<typeof config>) => {
    setConfig(prev => ({...prev, ...newConfig}));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-spotify-darker to-slate-900">
        <CardHeader className="pb-0">
          <CardTitle className="text-2xl md:text-3xl text-center bg-gradient-to-r from-blue-300 to-cyan-200 bg-clip-text text-transparent">
            {userName ? `${userName}'s` : "Your"} Impact Calculator
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            See how MYWATER system helps you save
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="environment">Environment</TabsTrigger>
              <TabsTrigger value="financial">Money</TabsTrigger>
              <TabsTrigger value="co2">CO₂ Reduction</TabsTrigger>
              <TabsTrigger value="settings">My Settings</TabsTrigger>
            </TabsList>
            
            <div className="mb-4">
              <PeriodToggle period={period} setPeriod={setPeriod} />
            </div>
            
            {activeTab === "environment" && (
              <ImpactSummary period={period} config={config} />
            )}
            
            {activeTab === "financial" && (
              <FinancialImpact period={period} config={config} />
            )}
            
            {activeTab === "co2" && (
              <CO2Impact period={period} config={config} />
            )}
            
            {activeTab === "settings" && (
              <WaterConsumptionSettings config={config} onConfigChange={handleConfigChange} />
            )}
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
