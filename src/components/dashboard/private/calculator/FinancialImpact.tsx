
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { calculateBottlesSaved, calculateMoneySaved } from "@/utils/formatUnitVolume";
import { Coins, TrendingUp } from "lucide-react";

interface FinancialImpactProps {
  period: "week" | "month" | "year" | "all-time";
  config: {
    bottleSize: number;
    bottleCost: number;
    dailyIntake: number;
  };
}

export function FinancialImpact({ period, config }: FinancialImpactProps) {
  // Calculate period multiplier
  const periodMultiplier = useMemo(() => {
    switch (period) {
      case "week": return 7;
      case "month": return 30;
      case "year": return 365;
      case "all-time": return 365 * 2; // Assume 2 years for all-time
      default: return 1;
    }
  }, [period]);

  // Calculate base water consumption
  const waterConsumedLiters = config.dailyIntake * periodMultiplier;
  
  // Calculate metrics
  const bottlesSaved = calculateBottlesSaved(waterConsumedLiters, config.bottleSize);
  const moneySaved = calculateMoneySaved(bottlesSaved, config.bottleCost);
  
  // Calculate future savings
  const yearlySavings = period !== "year" 
    ? calculateMoneySaved(calculateBottlesSaved(config.dailyIntake * 365, config.bottleSize), config.bottleCost) 
    : moneySaved;
  const fiveYearSavings = yearlySavings * 5;
  const tenYearSavings = yearlySavings * 10;

  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-900/20 border border-amber-500/20 rounded-lg text-center">
        <Coins className="h-8 w-8 mb-2 mx-auto text-amber-400" />
        <h3 className="text-lg font-medium text-gray-200 mb-1">Total Money Saved</h3>
        <p className="text-3xl font-bold text-amber-400">
          €{moneySaved.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Based on {config.bottleSize}L bottles at €{config.bottleCost?.toFixed(2)} each
        </p>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-center">Projected Savings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-b from-spotify-darker to-slate-900">
            <p className="text-sm text-gray-400">Yearly</p>
            <p className="text-xl font-bold">€{yearlySavings.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{calculateBottlesSaved(config.dailyIntake * 365, config.bottleSize).toFixed(0)} bottles</p>
          </Card>
          
          <Card className="p-4 bg-gradient-to-b from-spotify-darker to-slate-900">
            <p className="text-sm text-gray-400">5 Years</p>
            <p className="text-xl font-bold">€{fiveYearSavings.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{calculateBottlesSaved(config.dailyIntake * 365 * 5, config.bottleSize).toFixed(0)} bottles</p>
          </Card>
          
          <Card className="p-4 bg-gradient-to-b from-spotify-darker to-slate-900">
            <p className="text-sm text-gray-400">10 Years</p>
            <p className="text-xl font-bold">€{tenYearSavings.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{calculateBottlesSaved(config.dailyIntake * 365 * 10, config.bottleSize).toFixed(0)} bottles</p>
          </Card>
        </div>
      </div>
      
      <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <h3 className="text-md font-medium">Return on Investment</h3>
        </div>
        <p className="text-sm text-gray-400 mb-2">
          Based on your current usage, your MYWATER system will pay for itself in:
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Basic System (€199)</p>
            <p className="font-bold">{(199 / (yearlySavings / 12)).toFixed(1)} months</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">PLUS System (€299)</p>
            <p className="font-bold">{(299 / (yearlySavings / 12)).toFixed(1)} months</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">PRO System (€2,499)</p>
            <p className="font-bold">{(2499 / (yearlySavings / 12)).toFixed(1)} months</p>
          </div>
        </div>
      </div>
    </div>
  );
}
