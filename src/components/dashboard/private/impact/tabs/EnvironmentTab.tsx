
import { Award, Coins, Leaf, Recycle, Waves } from "lucide-react";
import { ImpactCard } from "@/components/dashboard/private/impact/ImpactCard";
import { ImpactPeriodToggle } from "@/components/dashboard/private/impact/ImpactPeriodToggle";
import { ReductionEquivalents } from "@/components/dashboard/private/impact/ReductionEquivalents";
import { formatMetricValue } from "@/utils/formatUnitVolume";

interface EnvironmentTabProps {
  period: "day" | "month" | "year" | "all-time";
  setPeriod: (value: "day" | "month" | "year" | "all-time") => void;
  bottlesSaved: number;
  waterSaved: number;
  plasticSaved: number;
  co2Saved: number;
  moneySaved: number;
}

export function EnvironmentTab({ 
  period, 
  setPeriod,
  bottlesSaved,
  waterSaved,
  plasticSaved,
  co2Saved,
  moneySaved
}: EnvironmentTabProps) {
  // Format numbers with proper decimal places
  const formatBottles = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  const formatMoney = (value: number) => `€${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  const formatWeight = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  
  return (
    <div className="space-y-6">
      {/* Period Toggle */}
      <ImpactPeriodToggle 
        period={period} 
        setPeriod={setPeriod} 
        includeAllTime={true} 
      />
      
      <div className="text-center mb-2">
        <p className="text-gray-300">Using MYWATER instead of plastic bottles has already saved:</p>
      </div>
      
      {/* Impact Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ImpactCard
          title="Bottles Saved"
          value={formatBottles(bottlesSaved)}
          icon={Waves}
          className="bg-blue-900/20 border-blue-600/20"
          iconColor="text-blue-400"
        />
        <ImpactCard
          title="Money Saved"
          value={formatMoney(moneySaved)}
          icon={Coins}
          className="bg-amber-900/20 border-amber-600/20"
          iconColor="text-amber-400"
        />
        <ImpactCard
          title="CO₂ Reduced"
          value={`${formatWeight(co2Saved)} kg`}
          icon={Leaf}
          className="bg-emerald-900/20 border-emerald-600/20"
          iconColor="text-emerald-400"
        />
        <ImpactCard
          title="Plastic Saved"
          value={`${formatWeight(plasticSaved)} kg`}
          icon={Recycle}
          className="bg-green-900/20 border-green-600/20"
          iconColor="text-green-400"
        />
      </div>

      {/* Achievement Badges */}
      <div className="flex justify-center flex-wrap gap-3 mt-4">
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
      
      {/* Environmental Equivalents */}
      <ReductionEquivalents
        co2Saved={co2Saved}
        plasticSaved={plasticSaved}
        bottlesSaved={bottlesSaved}
        period={period}
      />
    </div>
  );
}
