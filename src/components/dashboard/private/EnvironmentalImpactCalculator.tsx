
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Waves, Recycle, Leaf, Droplet, Coins } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImpactCard } from "./impact/ImpactCard";
import { ImpactTabs } from "./impact/ImpactTabs";
import { useImpactCalculations, ImpactConfig } from "@/hooks/dashboard/useImpactCalculations";

export function EnvironmentalImpactCalculator() {
  const [period, setPeriod] = useState<"day" | "month" | "year" | "all-time">("year");
  const [config, setConfig] = useState<Partial<ImpactConfig>>({
    userType: 'home', // Default to home user
    bottleSize: 0.5,  // Default to 0.5L bottles
    bottleCost: 1.10  // Default to €1.10 per bottle
  });
  
  const isMobile = useIsMobile();
  
  const { 
    bottlesSaved, 
    waterSaved, 
    plasticSaved, 
    co2Saved, 
    moneySaved,
    impactDetails,
    equivalents
  } = useImpactCalculations(period, config);

  const handleConfigChange = (newConfig: Partial<ImpactConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  return (
    <Card className="p-4 md:p-6 bg-spotify-darker border-spotify-accent">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-center">Environmental Impact Calculator</h2>
          <p className="text-gray-400 text-center text-sm md:text-base mt-1">
            See how your MYWATER system helps the planet
          </p>
        </div>

        <ImpactTabs 
          period={period} 
          setPeriod={setPeriod} 
          config={config}
          onConfigChange={handleConfigChange}
        />

        {/* Impact Cards Grid - Different for home vs business */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {config.userType === 'home' ? (
            <>
              <ImpactCard
                title="Bottles Saved"
                value={bottlesSaved.toLocaleString()}
                icon={Waves}
                className="bg-spotify-accent/20"
              />
              <ImpactCard
                title="Money Saved"
                value={`€${moneySaved.toFixed(2)}`}
                icon={Coins}
                className="bg-spotify-accent/20"
                iconColor="text-amber-400"
              />
              <ImpactCard
                title="Plastic Saved"
                value={`${plasticSaved.toFixed(1)} kg`}
                icon={Recycle}
                className="bg-spotify-accent/20"
                iconColor="text-green-400"
              />
              <ImpactCard
                title="CO₂ Reduced"
                value={`${co2Saved.toFixed(1)} kg`}
                icon={Leaf}
                className="bg-spotify-accent/20"
                iconColor="text-emerald-400"
              />
            </>
          ) : (
            <>
              <ImpactCard
                title="Water Purified"
                value={`${waterSaved.toLocaleString()} L`}
                icon={Droplet}
                className="bg-spotify-accent/20"
                iconColor="text-blue-400"
              />
              <ImpactCard
                title="Bottles Avoided"
                value={bottlesSaved.toLocaleString()}
                icon={Waves}
                className="bg-spotify-accent/20"
              />
              <ImpactCard
                title="CO₂ Reduced"
                value={`${co2Saved.toFixed(1)} kg`}
                icon={Leaf}
                className="bg-spotify-accent/20"
                iconColor="text-emerald-400"
              />
              <ImpactCard
                title="Plastic Avoided"
                value={`${plasticSaved.toFixed(1)} kg`}
                icon={Recycle}
                className="bg-spotify-accent/20"
                iconColor="text-green-400"
              />
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
