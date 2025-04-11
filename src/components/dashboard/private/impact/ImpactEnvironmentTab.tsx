
import { Waves, Recycle, Leaf, Coins, Award } from "lucide-react";
import { ImpactConfig, useImpactCalculations } from "@/hooks/dashboard/useImpactCalculations";
import { ImpactCard } from "./ImpactCard";
import { ImpactPeriodToggle } from "./ImpactPeriodToggle";

interface ImpactEnvironmentTabProps {
  period: "day" | "month" | "year" | "all-time";
  setPeriod: (period: "day" | "month" | "year" | "all-time") => void;
  config: Partial<ImpactConfig>;
}

export function ImpactEnvironmentTab({ 
  period, 
  setPeriod, 
  config 
}: ImpactEnvironmentTabProps) {
  const { 
    bottlesSaved, 
    waterSaved, 
    plasticSaved, 
    co2Saved, 
    moneySaved 
  } = useImpactCalculations(period, config);

  return (
    <div className="space-y-4">
      {/* Period Toggle */}
      <ImpactPeriodToggle 
        period={period} 
        setPeriod={setPeriod} 
        includeAllTime={true} 
      />
      
      <div className="text-center text-gray-400">
        <p>Using MYWATER instead of plastic bottles has already saved:</p>
        <p className="mt-0.5 text-xs text-gray-500">
          Based on {config.bottleSize}L bottles at €{config.bottleCost?.toFixed(2)} each
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ImpactCard
          title="Bottles Saved"
          value={bottlesSaved.toFixed(1)}
          icon={Waves}
          className="bg-blue-900/20 border-blue-600/20"
          iconColor="text-blue-400"
        />
        <ImpactCard
          title="Money Saved"
          value={`€${moneySaved.toFixed(2)}`}
          icon={Coins}
          className="bg-amber-900/20 border-amber-600/20"
          iconColor="text-amber-400"
        />
        <ImpactCard
          title="CO₂ Reduced"
          value={`${co2Saved.toFixed(1)} kg`}
          icon={Leaf}
          className="bg-emerald-900/20 border-emerald-600/20"
          iconColor="text-emerald-400"
        />
        <ImpactCard
          title="Plastic Saved"
          value={`${plasticSaved.toFixed(1)} kg`}
          icon={Recycle}
          className="bg-green-900/20 border-green-600/20"
          iconColor="text-green-400"
        />
      </div>

      {/* User badges for gamification */}
      <div className="flex justify-center flex-wrap gap-2 mt-3">
        {bottlesSaved >= 100 && (
          <div className="flex items-center bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-1 rounded-full">
            <Award className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">100+ Bottles</span>
          </div>
        )}
        {bottlesSaved >= 500 && (
          <div className="flex items-center bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 rounded-full">
            <Award className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">500+ Bottles</span>
          </div>
        )}
        {bottlesSaved >= 1000 && (
          <div className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full">
            <Award className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">1000+ Bottles</span>
          </div>
        )}
      </div>
    </div>
  );
}
