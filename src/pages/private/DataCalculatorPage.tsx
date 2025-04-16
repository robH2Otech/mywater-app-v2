
import { ImpactCalculatorContent } from "@/components/dashboard/private/impact/ImpactCalculatorContent";
import { useState } from "react";

export function DataCalculatorPage() {
  const [period, setPeriod] = useState<"day" | "month" | "year" | "all-time">("month");
  const [config, setConfig] = useState({
    bottleSize: 0.5,
    bottleCost: 1.10,
    userType: "home" as const
  });

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
        Your Environmental Impact
      </h1>
      <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-cyan-600/30 rounded-xl p-4 shadow-xl">
        <ImpactCalculatorContent 
          period={period}
          setPeriod={setPeriod}
          config={config}
          onConfigChange={(newConfig) => setConfig(prev => ({ ...prev, ...newConfig }))}
          userName=""
        />
      </div>
    </div>
  );
}
