
import { useState } from "react";
import { ImpactCalculatorContent } from "@/components/dashboard/private/impact/ImpactCalculatorContent";

export function DataCalculatorPage() {
  const [period, setPeriod] = useState<"week" | "month" | "year" | "all-time">("month");
  const [config, setConfig] = useState({
    bottleSize: 0.5,
    bottleCost: 1.10,
    userType: "home" as const,
    dailyIntake: 2.0
  });

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Your Environmental Impact</h1>
      <ImpactCalculatorContent 
        period={period}
        setPeriod={setPeriod}
        config={config}
        onConfigChange={(newConfig) => setConfig(prev => ({ ...prev, ...newConfig }))}
        userName=""
      />
    </div>
  );
}
