
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
    weekly: 0,
    monthly: 0,
    yearly: 0,
    fiveYear: 0,
  });

  useEffect(() => {
    // Calculate number of bottles saved
    const dailyBottles = dailyConsumption / baseBottleSize;
    const weeklySavings = dailyBottles * 7 * bottlePrice;
    const monthlySavings = dailyBottles * 30 * bottlePrice;
    const yearlySavings = dailyBottles * 365 * bottlePrice;
    const fiveYearSavings = yearlySavings * 5;

    setSavings({
      weekly: weeklySavings,
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
              max={10}
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

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-blue-600/30 p-2 rounded-md text-center">
              <p className="text-xs text-gray-400">Weekly</p>
              <p className="text-base font-bold text-blue-300">€{savings.weekly.toFixed(2)}</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-indigo-600/30 p-2 rounded-md text-center">
              <p className="text-xs text-gray-400">Monthly</p>
              <p className="text-base font-bold text-indigo-300">€{savings.monthly.toFixed(2)}</p>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 border-green-600/30 p-2 rounded-md text-center">
              <p className="text-xs text-gray-400">Yearly</p>
              <p className="text-base font-bold text-emerald-300">€{savings.yearly.toFixed(2)}</p>
            </div>
            
            <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/30 border-amber-600/30 p-2 rounded-md text-center">
              <p className="text-xs text-gray-400">5 Years</p>
              <p className="text-base font-bold text-amber-300">€{savings.fiveYear.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
