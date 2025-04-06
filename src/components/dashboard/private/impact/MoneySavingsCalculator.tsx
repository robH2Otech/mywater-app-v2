
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FormInput } from "@/components/shared/FormInput";
import { ImpactCard } from "./ImpactCard";
import { Coins, Calculator, TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function MoneySavingsCalculator() {
  const [bottlePrice, setBottlePrice] = useState("1.5");
  const [systemCost, setSystemCost] = useState("300");
  const [systemLifetime, setSystemLifetime] = useState("5");
  const [dailyConsumption, setDailyConsumption] = useState("2");
  const isMobile = useIsMobile();

  // Calculated values
  const [annualBottleCost, setAnnualBottleCost] = useState(0);
  const [annualSystemCost, setAnnualSystemCost] = useState(0);
  const [annualSavings, setAnnualSavings] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  
  useEffect(() => {
    // Calculate costs and savings
    const bottlePriceNum = parseFloat(bottlePrice) || 0;
    const systemCostNum = parseFloat(systemCost) || 1;
    const systemLifetimeNum = parseFloat(systemLifetime) || 1;
    const dailyConsumptionNum = parseFloat(dailyConsumption) || 0;
    
    // Annual costs for bottled water
    const annualBottleCostCalc = bottlePriceNum * dailyConsumptionNum * 365;
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
  }, [bottlePrice, systemCost, systemLifetime, dailyConsumption]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className="p-4 bg-spotify-darker">
          <CardContent className="p-2 space-y-4">
            <h3 className="text-lg font-medium text-center mb-2">Calculate Your Savings</h3>
            
            <FormInput
              label="Bottled Water Price (€/bottle)"
              value={bottlePrice}
              onChange={setBottlePrice}
              type="number"
              min="0.1"
              step="0.1"
            />
            
            <FormInput
              label="Daily Consumption (bottles)"
              value={dailyConsumption}
              onChange={setDailyConsumption}
              type="number"
              min="1"
              step="1"
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
              title="Annual Bottled Cost"
              value={`€${annualBottleCost.toFixed(2)}`}
              icon={Coins}
              iconColor="text-amber-500"
              className="bg-spotify-darker"
            />
            
            <ImpactCard
              title="Annual MYWATER Cost"
              value={`€${annualSystemCost.toFixed(2)}`}
              icon={Calculator}
              iconColor="text-emerald-500"
              className="bg-spotify-darker"
            />
          </div>
          
          <ImpactCard
            title={`Total Savings Over ${systemLifetime} Years`}
            value={`€${totalSavings.toFixed(2)}`}
            icon={TrendingUp}
            iconColor="text-green-400"
            valueClassName="text-green-400"
            className="bg-spotify-darker"
          />
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-400">
        <p>By using MYWATER, you could save approximately <strong className="text-green-400">€{annualSavings.toFixed(2)}</strong> per year.</p>
        <p className="mt-1">That's <strong className="text-green-400">€{(annualSavings/12).toFixed(2)}</strong> monthly or <strong className="text-green-400">€{(annualSavings/365).toFixed(2)}</strong> daily.</p>
      </div>
    </div>
  );
}
