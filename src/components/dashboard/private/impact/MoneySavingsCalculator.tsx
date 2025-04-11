
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { EuroIcon, TrendingUp } from "lucide-react";

interface MoneySavingsCalculatorProps {
  baseBottlePrice: number;
  baseDailyConsumption: number;
  baseBottleSize: number;
}

export function MoneySavingsCalculator({
  baseBottlePrice = 1.1,
  baseDailyConsumption = 2.0,
  baseBottleSize = 0.5
}: MoneySavingsCalculatorProps) {
  const [dailyConsumption, setDailyConsumption] = useState(baseDailyConsumption);
  const [bottlePrice, setBottlePrice] = useState(baseBottlePrice);
  
  const [monthlySavings, setMonthlySavings] = useState(0);
  const [yearlySavings, setYearlySavings] = useState(0);
  const [fiveYearSavings, setFiveYearSavings] = useState(0);
  
  useEffect(() => {
    const calculateSavings = () => {
      // Calculate number of bottles saved based on consumption and bottle size
      const dailyBottlesSaved = dailyConsumption / baseBottleSize;
      
      // Calculate savings
      const dailySavings = dailyBottlesSaved * bottlePrice;
      const monthly = dailySavings * 30;
      const yearly = dailySavings * 365;
      const fiveYear = yearly * 5;
      
      setMonthlySavings(monthly);
      setYearlySavings(yearly);
      setFiveYearSavings(fiveYear);
    };
    
    calculateSavings();
  }, [dailyConsumption, bottlePrice, baseBottleSize]);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-spotify-dark/50 rounded-lg space-y-6">
        <h3 className="text-center font-medium">Calculate Your Savings</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="daily-consumption">Daily Water Consumption</Label>
              <span className="text-sm font-medium">{dailyConsumption.toFixed(1)} L</span>
            </div>
            <Slider
              id="daily-consumption"
              min={0.5}
              max={5.0}
              step={0.1}
              value={[dailyConsumption]}
              onValueChange={(value) => setDailyConsumption(value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="bottle-price">Bottle Price (€)</Label>
              <span className="text-sm font-medium">€{bottlePrice.toFixed(2)}</span>
            </div>
            <Slider
              id="bottle-price"
              min={0.5}
              max={3.0}
              step={0.1}
              value={[bottlePrice]}
              onValueChange={(value) => setBottlePrice(value[0])}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-amber-900/20 border-amber-600/20">
          <div className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <EuroIcon className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-300">Monthly Savings</h3>
            <p className="text-2xl font-bold">€{monthlySavings.toFixed(2)}</p>
          </div>
        </Card>
        
        <Card className="bg-green-900/20 border-green-600/20">
          <div className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <EuroIcon className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-300">Yearly Savings</h3>
            <p className="text-2xl font-bold">€{yearlySavings.toFixed(2)}</p>
          </div>
        </Card>
        
        <Card className="bg-blue-900/20 border-blue-600/20">
          <div className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-300">5-Year Savings</h3>
            <p className="text-2xl font-bold">€{fiveYearSavings.toFixed(2)}</p>
          </div>
        </Card>
      </div>
      
      <div className="p-4 bg-gradient-to-r from-amber-900/30 to-green-900/30 rounded-lg text-center">
        <p className="text-sm">
          Based on {dailyConsumption.toFixed(1)}L daily consumption and €{bottlePrice.toFixed(2)} per {baseBottleSize}L bottle,
          you save approximately €{(yearlySavings / 12).toFixed(2)} per month with your MYWATER system.
        </p>
      </div>
    </div>
  );
}
