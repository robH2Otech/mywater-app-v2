
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Droplets } from "lucide-react";
import { ImpactConfig } from "@/hooks/dashboard/useImpactCalculations";
import { useToast } from "@/hooks/use-toast";

interface ImpactSettingsProps {
  currentConfig: Partial<ImpactConfig>;
  onConfigChange: (config: Partial<ImpactConfig>) => void;
}

export function ImpactSettings({ currentConfig, onConfigChange }: ImpactSettingsProps) {
  const [bottleSize, setBottleSize] = useState((currentConfig.bottleSize || 0.5).toString());
  const [bottleCost, setBottleCost] = useState((currentConfig.bottleCost || 1.10).toString());
  const [co2PerBottle, setCo2PerBottle] = useState("160.5"); // Default for 0.5L
  const [plasticPerBottle, setPlasticPerBottle] = useState((currentConfig.plasticPerBottle || 20).toString());
  const [dailyIntake, setDailyIntake] = useState((currentConfig.dailyIntake || 2).toString());
  const [mywaterModel, setMywaterModel] = useState("basic"); // Default to Basic model
  const { toast } = useToast();
  
  // Update CO2 value when bottle size changes
  useEffect(() => {
    const size = parseFloat(bottleSize);
    let co2Value = 160.5; // Default for 0.5L
    
    if (size === 1.0) {
      co2Value = 321;
    } else if (size === 1.5) {
      co2Value = 481.5;
    } else if (size === 2.0) {
      co2Value = 642;
    }
    
    setCo2PerBottle(co2Value.toString());
  }, [bottleSize]);
  
  const handleApplySettings = () => {
    onConfigChange({
      bottleSize: parseFloat(bottleSize),
      bottleCost: parseFloat(bottleCost),
      co2PerBottle: parseFloat(co2PerBottle),
      plasticPerBottle: parseFloat(plasticPerBottle),
      dailyIntake: parseFloat(dailyIntake),
      userType: 'home'
    });
    
    toast({
      title: "Settings applied",
      description: "Your water consumption settings have been updated.",
    });
  };
  
  const applyPreset = (preset: 'small' | 'medium' | 'large' | 'custom') => {
    if (preset === 'custom') return; // Custom keeps current values
    
    let size: number;
    let cost: number;
    let plastic: number;
    
    switch (preset) {
      case 'small':
        size = 0.5;
        cost = 1.10;
        plastic = 20;
        break;
      case 'medium':
        size = 1.0;
        cost = 1.50;
        plastic = 30;
        break;
      case 'large':
        size = 1.5;
        cost = 1.80;
        plastic = 40;
        break;
    }
    
    setBottleSize(size.toString());
    setBottleCost(cost.toString());
    setPlasticPerBottle(plastic.toString());
    // CO2 is automatically updated by the useEffect
  };
  
  const getMywaterPrice = () => {
    switch (mywaterModel) {
      case 'basic': return 199;
      case 'plus': return 299;
      case 'pro': return 2499;
      default: return 199;
    }
  };
  
  // Calculate water intake visualization data
  const dailyIntakeValue = parseFloat(dailyIntake);
  const recommendedIntake = 2.7; // recommended daily water intake in liters
  const intakePercentage = Math.min(100, Math.round((dailyIntakeValue / recommendedIntake) * 100));
  const strokeDasharray = `${intakePercentage} ${100 - intakePercentage}`;
  
  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h3 className="text-lg font-medium">My Water Consumption</h3>
        <p className="text-sm text-gray-400">Customize how your environmental impact is calculated</p>
      </div>
      
      {/* Bottle Presets */}
      <div className="mb-3">
        <p className="text-xs text-gray-400 mb-2">Bottle Size Presets:</p>
        <div className="grid grid-cols-4 gap-2">
          <Button 
            variant={(bottleSize === "0.5") ? "default" : "outline"}
            size="sm"
            onClick={() => applyPreset('small')}
            className={(bottleSize === "0.5") ? 'bg-mywater-blue h-8' : 'h-8'}
          >
            0.5L
          </Button>
          
          <Button 
            variant={(bottleSize === "1") ? "default" : "outline"}
            size="sm"
            onClick={() => applyPreset('medium')}
            className={(bottleSize === "1") ? 'bg-mywater-blue h-8' : 'h-8'}
          >
            1.0L
          </Button>
          
          <Button 
            variant={(bottleSize === "1.5") ? "default" : "outline"}
            size="sm"
            onClick={() => applyPreset('large')}
            className={(bottleSize === "1.5") ? 'bg-mywater-blue h-8' : 'h-8'}
          >
            1.5L
          </Button>
          
          <Button 
            variant={!["0.5", "1", "1.5"].includes(bottleSize) ? "default" : "outline"}
            size="sm"
            onClick={() => applyPreset('custom')}
            className={!["0.5", "1", "1.5"].includes(bottleSize) ? 'bg-mywater-blue h-8' : 'h-8'}
          >
            Custom
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card className="bg-spotify-darker">
            <CardContent className="p-3 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <label className="text-xs w-28 text-gray-400">Bottle Size (L)</label>
                <input 
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={bottleSize}
                  onChange={(e) => setBottleSize(e.target.value)}
                  className="flex h-7 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              
              <div className="flex items-center gap-1.5">
                <label className="text-xs w-28 text-gray-400">Bottle Cost (€)</label>
                <input 
                  type="number"
                  min="0.1"
                  step="0.01"
                  value={bottleCost}
                  onChange={(e) => setBottleCost(e.target.value)}
                  className="flex h-7 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              
              <div className="flex items-center gap-1.5">
                <label className="text-xs w-28 text-gray-400">CO₂ per Bottle (g)</label>
                <input 
                  type="number"
                  min="1"
                  step="0.1"
                  value={co2PerBottle}
                  disabled
                  className="flex h-7 w-full rounded-md border border-input bg-background/50 px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring opacity-80"
                />
              </div>
              
              <div className="flex items-center gap-1.5">
                <label className="text-xs w-28 text-gray-400">Plastic per Bottle (g)</label>
                <input 
                  type="number"
                  min="1"
                  step="0.1"
                  value={plasticPerBottle}
                  onChange={(e) => setPlasticPerBottle(e.target.value)}
                  className="flex h-7 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              
              <div className="flex items-center gap-1.5">
                <label className="text-xs w-28 text-gray-400">Daily Water Intake (L)</label>
                <input 
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={dailyIntake}
                  onChange={(e) => setDailyIntake(e.target.value)}
                  className="flex h-7 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              
              <div className="flex items-center gap-1.5 pt-2 border-t border-gray-700/30">
                <label className="text-xs w-28 text-gray-400">MYWATER Model</label>
                <select
                  value={mywaterModel}
                  onChange={(e) => setMywaterModel(e.target.value)}
                  className="flex h-7 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="basic">MYWATER Home Basic (€199)</option>
                  <option value="plus">MYWATER Home PLUS (€299)</option>
                  <option value="pro">MYWATER PRO (€2499)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Water Intake Donut Chart */}
        <div className="md:col-span-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg width="120" height="120" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  fill="none" 
                  stroke="#2c3440" 
                  strokeWidth="12" 
                />
                {/* Progress circle */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  fill="none" 
                  stroke="#39afcd" 
                  strokeWidth="12" 
                  strokeDasharray={strokeDasharray} 
                  strokeDashoffset="25" 
                  transform="rotate(-90 60 60)" 
                />
                {/* Water icon in the center */}
                <foreignObject x="35" y="35" width="50" height="50">
                  <div className="h-full w-full flex items-center justify-center">
                    <Droplets className="h-8 w-8 text-blue-400" />
                  </div>
                </foreignObject>
              </svg>
              <div className="absolute bottom-1 w-full text-center">
                <p className="text-xs font-medium text-gray-300">{intakePercentage}%</p>
                <p className="text-3xs text-gray-400">of recommended</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400">Daily Water Intake</p>
            <p className="text-sm font-medium">{dailyIntake}L / 2.7L</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-3">
        <Button 
          onClick={handleApplySettings}
          className="bg-mywater-blue hover:bg-mywater-blue/90"
        >
          Apply Settings
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 text-center mt-1">
        These settings are used to calculate your environmental and financial impact.
      </p>
    </div>
  );
}
