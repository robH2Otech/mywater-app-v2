
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FormInput } from "@/components/shared/FormInput";
import { ImpactCard } from "./ImpactCard";
import { Coins, Calculator, TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatMetricValue } from "@/utils/formatUnitVolume";

interface MoneySavingsCalculatorProps {
  baseBottlePrice?: number;
  baseDailyConsumption?: number;
  baseBottleSize?: number;
}

export function MoneySavingsCalculator({
  baseBottlePrice = 1.1,
  baseDailyConsumption = 2,
  baseBottleSize = 0.5
}: MoneySavingsCalculatorProps) {
  const [bottlePrice, setBottlePrice] = useState(baseBottlePrice.toString());
  const [systemCost, setSystemCost] = useState("300");
  const [systemLifetime, setSystemLifetime] = useState("5");
  const [dailyConsumption, setDailyConsumption] = useState(baseDailyConsumption.toString());
  const [bottleSize, setBottleSize] = useState(baseBottleSize.toString());
  const isMobile = useIsMobile();

  // Calculated values
  const [annualBottleCost, setAnnualBottleCost] = useState(0);
  const [annualSystemCost, setAnnualSystemCost] = useState(0);
  const [annualSavings, setAnnualSavings] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [bottlesPerDay, setBottlesPerDay] = useState(0);
  
  useEffect(() => {
    // Calculate costs and savings
    const bottlePriceNum = parseFloat(bottlePrice) || 0;
    const systemCostNum = parseFloat(systemCost) || 1;
    const systemLifetimeNum = parseFloat(systemLifetime) || 1;
    const dailyConsumptionNum = parseFloat(dailyConsumption) || 0;
    const bottleSizeNum = parseFloat(bottleSize) || 0.5;
    
    // Calculate bottles per day based on consumption and bottle size
    const bottlesPerDayCalc = dailyConsumptionNum / bottleSizeNum;
    setBottlesPerDay(bottlesPerDayCalc);
    
    // Annual costs for bottled water
    const annualBottleCostCalc = bottlePriceNum * bottlesPerDayCalc * 365;
    setAnnualBottleCost(annualBottleCostCalc);
    
    // Annual cost for MYWATER system (total cost divided by years)
    const annualSystemCostCalc = systemCostNum / systemLifetimeNum;
    setAnnualSystemCost(annualSystemCostCalc);
    
    // Annual savings
    const annualSavingsCalc = annualBottleCostCalc - annualSystemCostCalc;
    setAnnualSavings(annualSavingsCalc);
    
    // Total savings over system lifetime
    const totalSavingsCalc = annualSavingsCalc * systemLifetimeNum;
    setTotalSavings(totalSavingsCalc);
  }, [bottlePrice, systemCost, systemLifetime, dailyConsumption, bottleSize]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left column - Key Results */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <ImpactCard
              title="Annual Bottle Cost"
              value={`€${formatMetricValue(annualBottleCost, 'money')}`}
              icon={Coins}
              iconColor="text-amber-500"
              className="bg-spotify-darker"
              compactMode={isMobile}
            />
            
            <ImpactCard
              title="Annual MYWATER Cost"
              value={`€${formatMetricValue(annualSystemCost, 'money')}`}
              icon={Calculator}
              iconColor="text-emerald-500"
              className="bg-spotify-darker"
              compactMode={isMobile}
            />
          </div>
          
          <ImpactCard
            title={`${systemLifetime}-Year Savings`}
            value={`€${formatMetricValue(totalSavings, 'money')}`}
            icon={TrendingUp}
            iconColor="text-green-400"
            valueClassName="text-green-400"
            className="bg-spotify-darker"
            compactMode={isMobile}
          />
          
          <div className="text-center text-xs text-gray-400 p-2 bg-spotify-dark rounded-lg">
            <p>Save <strong className="text-green-400">€{formatMetricValue(annualSavings, 'money')}</strong> per year</p>
            <p className="text-xs">(<strong>€{formatMetricValue(annualSavings/12, 'money')}</strong>/month)</p>
          </div>
        </div>
        
        {/* Right column - Calculator */}
        <Card className="bg-spotify-darker">
          <CardContent className="p-2 space-y-2">
            <h3 className="text-sm font-medium text-center">Calculate Savings</h3>
            
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-1.5">
                <label className="text-xs w-24 text-gray-400">Daily Water (L)</label>
                <input 
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={dailyConsumption}
                  onChange={(e) => setDailyConsumption(e.target.value)}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            
              <div className="flex items-center gap-1.5">
                <label className="text-xs w-24 text-gray-400">Bottle Size (L)</label>
                <input 
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={bottleSize}
                  onChange={(e) => setBottleSize(e.target.value)}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            
              <div className="flex items-center gap-1.5">
                <label className="text-xs w-24 text-gray-400">Bottle Price (€)</label>
                <input 
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={bottlePrice}
                  onChange={(e) => setBottlePrice(e.target.value)}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            
              <div className="flex items-center gap-1.5">
                <label className="text-xs w-24 text-gray-400">MYWATER Cost (€)</label>
                <input 
                  type="number"
                  min="1"
                  value={systemCost}
                  onChange={(e) => setSystemCost(e.target.value)}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            
              <div className="flex items-center gap-1.5">
                <label className="text-xs w-24 text-gray-400">System Life (years)</label>
                <input 
                  type="number"
                  min="1"
                  max="20"
                  value={systemLifetime}
                  onChange={(e) => setSystemLifetime(e.target.value)}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
