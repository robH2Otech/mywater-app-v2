
import { Card, CardContent } from "@/components/ui/card";
import { MoneySavingsCalculator } from "../MoneySavingsCalculator";
import { ImpactPeriodToggle } from "../ImpactPeriodToggle";

interface MoneyTabProps {
  period: "day" | "month" | "year" | "all-time";
  setPeriod: (value: "day" | "month" | "year" | "all-time") => void;
  config: {
    bottleSize: number;
    bottleCost: number;
    userType: "home" | "office" | "restaurant";
  };
}

export function MoneyTab({ period, setPeriod, config }: MoneyTabProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Money Savings Calculator</h3>
        <p className="text-sm text-gray-400">
          See how much money you save by using MYWATER
        </p>
      </div>
      
      <MoneySavingsCalculator 
        baseBottlePrice={config.bottleCost}
        baseBottleSize={config.bottleSize}
        baseDailyConsumption={2}
      />
      
      <Card className="bg-gradient-to-br from-amber-900/30 to-amber-700/20 p-4 border-amber-600/30">
        <CardContent className="p-0 space-y-3">
          <h3 className="text-center text-amber-300 font-medium">Return on Investment</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-400">Payback Period</p>
              <p className="text-xl font-bold text-amber-300">~9 months</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">5-Year Savings</p>
              <p className="text-xl font-bold text-amber-300">€1,700+</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Monthly Savings</p>
              <p className="text-xl font-bold text-amber-300">€28+</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
