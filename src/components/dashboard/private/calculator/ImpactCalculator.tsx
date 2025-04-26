
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImpactSummary } from "./ImpactSummary";
import { FinancialImpact } from "./FinancialImpact";
import { CO2Impact } from "./CO2Impact";
import { WaterConsumptionSettings } from "./WaterConsumptionSettings";
import { PeriodToggle } from "./PeriodToggle";
import { motion } from "framer-motion";
import { useCalculatorPreferences } from "@/hooks/dashboard/useCalculatorPreferences";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { toast } from "sonner";

interface ImpactCalculatorProps {
  userName?: string;
}

export function ImpactCalculator({ userName }: ImpactCalculatorProps) {
  const [period, setPeriod] = useState<"day" | "month" | "year" | "all-time">("year");
  const [activeTab, setActiveTab] = useState("environment");
  const { preferences, isLoading, savePreferences } = useCalculatorPreferences();

  // Handle save preferences with toast feedback
  const handleSavePreferences = (newPreferences: any) => {
    savePreferences(newPreferences);
    toast.success("Your preferences have been saved!");
  };

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <LoadingSkeleton />
        <LoadingSkeleton />
      </motion.div>
    );
  }

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
              <TabsTrigger value="co2">CO₂</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <div className="mb-4">
              {activeTab !== "settings" && (
                <PeriodToggle period={period} setPeriod={setPeriod} />
              )}
            </div>
            
            <TabsContent value="environment">
              <ImpactSummary period={period} config={preferences} />
            </TabsContent>
            
            <TabsContent value="financial">
              <FinancialImpact period={period} config={preferences} />
            </TabsContent>
            
            <TabsContent value="co2">
              <CO2Impact period={period} config={preferences} />
            </TabsContent>
            
            <TabsContent value="settings">
              <WaterConsumptionSettings 
                config={preferences}
                onConfigChange={handleSavePreferences}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
