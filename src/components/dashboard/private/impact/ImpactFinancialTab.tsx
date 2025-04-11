
import { ImpactConfig, useImpactCalculations } from "@/hooks/dashboard/useImpactCalculations";
import { ImpactPeriodToggle } from "./ImpactPeriodToggle";
import { MoneySavingsCalculator } from "./MoneySavingsCalculator";

interface ImpactFinancialTabProps {
  period: "day" | "month" | "year" | "all-time";
  setPeriod: (period: "day" | "month" | "year" | "all-time") => void;
  config: Partial<ImpactConfig>;
}

export function ImpactFinancialTab({ 
  period, 
  setPeriod, 
  config 
}: ImpactFinancialTabProps) {
  const { moneySaved } = useImpactCalculations(period, config);

  return (
    <div className="space-y-4">
      <h3 className="text-center font-medium">Financial Impact</h3>
      
      {/* Period Toggle */}
      <ImpactPeriodToggle 
        period={period} 
        setPeriod={setPeriod} 
        includeAllTime={true} 
      />
      
      <div className="p-4 bg-spotify-dark rounded-lg text-center mb-4">
        <h4 className="text-sm font-medium text-gray-200 mb-0.5">Total Money Saved</h4>
        <p className="text-3xl font-bold text-mywater-blue">
          €{moneySaved.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Based on {config.bottleSize}L bottles at €{config.bottleCost?.toFixed(2)} each
        </p>
      </div>
      
      <MoneySavingsCalculator 
        baseBottlePrice={config.bottleCost || 1.1}
        baseDailyConsumption={config.dailyIntake || 2}
        baseBottleSize={config.bottleSize || 0.5}
      />
    </div>
  );
}
