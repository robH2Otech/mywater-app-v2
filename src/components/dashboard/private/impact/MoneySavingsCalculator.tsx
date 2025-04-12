
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface MoneySavingsCalculatorProps {
  baseBottlePrice: number;
  baseDailyConsumption: number;
  baseBottleSize: number;
}

export function MoneySavingsCalculator({
  baseBottlePrice,
  baseDailyConsumption,
  baseBottleSize
}: MoneySavingsCalculatorProps) {
  const [dailyConsumption, setDailyConsumption] = useState(baseDailyConsumption);
  const [bottlePrice, setBottlePrice] = useState(baseBottlePrice);
  const [savings, setSavings] = useState({
    monthly: 0,
    yearly: 0,
    fiveYear: 0,
  });

  useEffect(() => {
    // Calculate number of bottles saved
    const dailyBottles = dailyConsumption / baseBottleSize;
    const monthlySavings = dailyBottles * 30 * bottlePrice;
    const yearlySavings = dailyBottles * 365 * bottlePrice;
    const fiveYearSavings = yearlySavings * 5;

    setSavings({
      monthly: monthlySavings,
      yearly: yearlySavings,
      fiveYear: fiveYearSavings
    });
  }, [dailyConsumption, bottlePrice, baseBottleSize]);

  return (
    <Card className="bg-spotify-dark/50 shadow">
      <CardContent className="p-4 space-y-4">
        <h3 className="text-sm font-semibold text-center">Customized Savings Calculator</h3>
        
        <div className="space-y-5 mt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label htmlFor="daily-consumption">Daily Water Consumption</Label>
              <span className="font-medium">{dailyConsumption.toFixed(1)}L</span>
            </div>
            <Slider
              id="daily-consumption"
              min={0.5}
              max={5}
              step={0.1}
              value={[dailyConsumption]}
              onValueChange={(value) => setDailyConsumption(value[0])}
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label htmlFor="bottle-price">Bottle Price</Label>
              <span className="font-medium">€{bottlePrice.toFixed(2)}</span>
            </div>
            <Slider
              id="bottle-price"
              min={0.5}
              max={3}
              step={0.1}
              value={[bottlePrice]}
              onValueChange={(value) => setBottlePrice(value[0])}
              className="cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="bg-blue-900/20 p-2 rounded-md text-center">
              <p className="text-xs text-gray-400">Monthly</p>
              <p className="text-base font-bold text-blue-300">€{savings.monthly.toFixed(2)}</p>
            </div>
            
            <div className="bg-emerald-900/20 p-2 rounded-md text-center">
              <p className="text-xs text-gray-400">Yearly</p>
              <p className="text-base font-bold text-emerald-300">€{savings.yearly.toFixed(2)}</p>
            </div>
            
            <div className="bg-amber-900/20 p-2 rounded-md text-center">
              <p className="text-xs text-gray-400">5 Years</p>
              <p className="text-base font-bold text-amber-300">€{savings.fiveYear.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
