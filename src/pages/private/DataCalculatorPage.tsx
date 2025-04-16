
import { ImpactCalculatorContent } from "@/components/dashboard/private/impact/ImpactCalculatorContent";
import { useUserPreferences } from "@/hooks/dashboard/useUserPreferences";
import { useState } from "react";

export function DataCalculatorPage() {
  const { preferences, savePreferences } = useUserPreferences();
  const [period, setPeriod] = useState<"day" | "month" | "year" | "all-time">("month");

  // Create a fully defined config object with default values as fallback
  const config = {
    bottleSize: preferences.bottleSize || 0.5,
    bottleCost: preferences.bottleCost || 1.10,
    userType: "home" as const
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-cyan-600/30 rounded-xl p-4 shadow-xl">
        <ImpactCalculatorContent 
          period={period}
          setPeriod={setPeriod}
          config={config}
          onConfigChange={savePreferences}
          userName=""
        />
      </div>
    </div>
  );
}
