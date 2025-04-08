
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
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-center">My Financial Impact</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className="p-4 bg-spotify-darker">
          <CardContent className="p-2 space-y-4">
            <h3 className="text-lg font-medium text-center mb-2">Calculate Your Savings</h3>
            
            <FormInput
              label="Daily Water Consumption (L)"
              value={dailyConsumption}
              onChange={setDailyConsumption}
              type="number"
              min="0.1"
              step="0.1"
            />
            
            <FormInput
              label="Bottle Size (L)"
              value={bottleSize}
              onChange={setBottleSize}
              type="number"
              min="0.1"
              step="0.1"
            />
            
            <FormInput
              label="Bottled Water Price (€/bottle)"
              value={bottlePrice}
              onChange={setBottlePrice}
              type="number"
              min="0.1"
              step="0.1"
            />
            
            <FormInput
              label="MYWATER System Cost (€)"
              value={systemCost}
              onChange={setSystemCost}
              type="number"
              min="1"
            />
            
            <FormInput
              label="System Lifetime (years)"
              value={systemLifetime}
              onChange={setSystemLifetime}
              type="number"
              min="1"
              max="20"
            />
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ImpactCard
              title="Annual Bottle Cost"
              value={`€${formatMetricValue(annualBottleCost, 'money')}`}
              icon={Coins}
              iconColor="text-amber-500"
              className="bg-spotify-darker"
            />
            
            <ImpactCard
              title="Annual MYWATER Cost"
              value={`€${formatMetricValue(annualSystemCost, 'money')}`}
              icon={Calculator}
              iconColor="text-emerald-500"
              className="bg-spotify-darker"
            />
          </div>
          
          <ImpactCard
            title={`Total Savings Over ${systemLifetime} Years`}
            value={`€${formatMetricValue(totalSavings, 'money')}`}
            icon={TrendingUp}
            iconColor="text-green-400"
            valueClassName="text-green-400"
            className="bg-spotify-darker"
          />
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-400">
        <p>By using MYWATER, you could save approximately <strong className="text-green-400">€{formatMetricValue(annualSavings, 'money')}</strong> per year.</p>
        <p className="mt-1">That's <strong className="text-green-400">€{formatMetricValue(annualSavings/12, 'money')}</strong> monthly or <strong className="text-green-400">€{formatMetricValue(annualSavings/365, 'money')}</strong> daily.</p>
        <p className="mt-1 text-xs">Based on {formatMetricValue(bottlesPerDay, 'bottles')} bottles ({bottleSize}L) per day at €{bottlePrice} each.</p>
      </div>
    </div>
  );
}
