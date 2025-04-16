
import { ImpactCalculatorContent } from "@/components/dashboard/private/impact/ImpactCalculatorContent";
import { useUserPreferences } from "@/hooks/dashboard/useUserPreferences";

export function DataCalculatorPage() {
  const { preferences, savePreferences } = useUserPreferences();

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-cyan-600/30 rounded-xl p-4 shadow-xl">
        <ImpactCalculatorContent 
          period="month"
          setPeriod={() => {}}
          config={{
            bottleSize: preferences.bottleSize,
            bottleCost: preferences.bottleCost,
            userType: "home"
          }}
          onConfigChange={savePreferences}
          userName=""
        />
      </div>
    </div>
  );
}
