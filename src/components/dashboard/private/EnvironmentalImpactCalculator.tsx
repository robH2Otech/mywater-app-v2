
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Waves, Recycle, Leaf, Droplet } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImpactCard } from "./impact/ImpactCard";
import { ImpactTabs } from "./impact/ImpactTabs";
import { useImpactCalculations } from "@/hooks/dashboard/useImpactCalculations";

export function EnvironmentalImpactCalculator() {
  const [period, setPeriod] = useState<"day" | "month" | "year">("year");
  const isMobile = useIsMobile();
  
  const { bottlesSaved, waterSaved, plasticSaved, co2Saved } = useImpactCalculations(period);

  return (
    <Card className="p-4 md:p-6 bg-spotify-darker border-spotify-accent">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-center">Environmental Impact Calculator</h2>
          <p className="text-gray-400 text-center text-sm md:text-base mt-1">
            See how your MYWATER system helps the planet
          </p>
        </div>

        <ImpactTabs period={period} setPeriod={setPeriod} />

        {/* Impact Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <ImpactCard
            title="Bottles Saved"
            value={bottlesSaved.toLocaleString()}
            icon={Waves}
            className="bg-spotify-accent/20"
          />
          <ImpactCard
            title="Water Saved"
            value={`${waterSaved.toLocaleString()} L`}
            icon={Droplet}
            className="bg-spotify-accent/20"
            iconColor="text-blue-400"
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
        </div>
      </div>
    </Card>
  );
}
