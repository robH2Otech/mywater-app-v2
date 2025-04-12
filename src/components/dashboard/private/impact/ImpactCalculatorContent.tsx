
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Waves, Recycle, Leaf, Coins } from "lucide-react";
import { ImpactCard } from "./ImpactCard";
import { ImpactTabs } from "./ImpactTabs";
import { useImpactCalculations } from "@/hooks/dashboard/useImpactCalculations";
import { ImpactMetricsDisplay } from "./ImpactMetricsDisplay";
import { ImpactAchievementBadges } from "./ImpactAchievementBadges";
import { motion } from "framer-motion";

interface ImpactCalculatorContentProps {
  period: "day" | "month" | "year" | "all-time";
  setPeriod: (period: "day" | "month" | "year" | "all-time") => void;
  config: {
    bottleSize: number;
    bottleCost: number;
    userType: "home"; // Using literal type "home" instead of string
  };
  onConfigChange: (config: Partial<{
    bottleSize: number;
    bottleCost: number;
    userType: "home"; // Using literal type "home" to match the expected type
  }>) => void;
  userName: string;
}

export function ImpactCalculatorContent({ 
  period, 
  setPeriod, 
  config, 
  onConfigChange,
  userName 
}: ImpactCalculatorContentProps) {
  const [activeTab, setActiveTab] = useState("environmental");

  const { 
    bottlesSaved, 
    waterSaved, 
    plasticSaved, 
    co2Saved, 
    moneySaved
  } = useImpactCalculations(period, config);

  // Add console log to verify this component is being rendered
  console.log("ImpactCalculatorContent rendered");

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Environmental Impact</h1>
        <Card className="p-6 bg-gradient-to-br from-spotify-darker via-slate-900/90 to-spotify-darker border-spotify-accent overflow-hidden">
          <div className="space-y-4">
            <div className="text-center">
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent"
              >
                {userName ? `${userName}'s` : 'Your'} Environmental Impact
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-400 mt-1.5"
              >
                See how your MYWATER system helps you and our planet
              </motion.p>
            </div>

            <ImpactTabs 
              period={period} 
              setPeriod={setPeriod} 
              config={config}
              onConfigChange={onConfigChange}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {activeTab === "environmental" && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <ImpactMetricsDisplay 
                  bottlesSaved={bottlesSaved}
                  moneySaved={moneySaved}
                  co2Saved={co2Saved}
                  plasticSaved={plasticSaved}
                  bottleSize={config.bottleSize}
                  bottleCost={config.bottleCost}
                />
                
                <ImpactAchievementBadges bottlesSaved={bottlesSaved} />
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
