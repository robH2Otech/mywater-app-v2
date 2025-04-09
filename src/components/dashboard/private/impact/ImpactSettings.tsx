
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { ImpactConfig } from "@/hooks/dashboard/useImpactCalculations";
import { BOTTLE_CONFIGS } from "@/utils/formatUnitVolume";
import { useToast } from "@/hooks/use-toast";

interface ImpactSettingsProps {
  currentConfig: Partial<ImpactConfig>;
  onConfigChange: (config: Partial<ImpactConfig>) => void;
}

export function ImpactSettings({ currentConfig, onConfigChange }: ImpactSettingsProps) {
  const [bottleSize, setBottleSize] = useState((currentConfig.bottleSize || 0.5).toString());
  const [bottleCost, setBottleCost] = useState((currentConfig.bottleCost || 1.10).toString());
  const [co2PerBottle, setCo2PerBottle] = useState((currentConfig.co2PerBottle || 160.5).toString());
  const [plasticPerBottle, setPlasticPerBottle] = useState((currentConfig.plasticPerBottle || 20).toString());
  const [dailyIntake, setDailyIntake] = useState((currentConfig.dailyIntake || 2).toString());
  const { toast } = useToast();
  
  const handleApplySettings = () => {
    onConfigChange({
      bottleSize: parseFloat(bottleSize),
      bottleCost: parseFloat(bottleCost),
      co2PerBottle: parseFloat(co2PerBottle),
      plasticPerBottle: parseFloat(plasticPerBottle),
      dailyIntake: parseFloat(dailyIntake),
      userType: 'home' // Always home user
    });
    
    toast({
      title: "Settings applied",
      description: "Your impact calculator settings have been updated.",
    });
  };
  
  const applyPreset = (preset: 'small' | 'medium' | 'large' | 'custom') => {
    if (preset === 'custom') return; // Custom keeps current values
    
    const config = BOTTLE_CONFIGS[preset];
    setBottleSize(config.size.toString());
    setBottleCost(config.cost.toString());
    setCo2PerBottle(config.co2.toString());
    setPlasticPerBottle(config.plastic.toString());
  };
  
  const isCustom = !Object.values(BOTTLE_CONFIGS).some(config => 
    config.size === parseFloat(bottleSize) && 
    config.cost === parseFloat(bottleCost) &&
    config.co2 === parseFloat(co2PerBottle) &&
    config.plastic === parseFloat(plasticPerBottle)
  );
  
  return (
    <div className="space-y-4">
      <div className="text-center mb-3">
        <h3 className="text-lg font-medium">Calculator Settings</h3>
        <p className="text-sm text-gray-400">Customize how your environmental impact is calculated</p>
      </div>
      
      {/* Bottle Presets */}
      <div className="mb-4">
        <p className="text-xs text-gray-400 mb-2">Bottle Size Presets:</p>
        <div className="grid grid-cols-4 gap-2">
          <Button 
            variant={!isCustom && currentConfig.bottleSize === 0.5 ? "default" : "outline"}
            size="sm"
            onClick={() => applyPreset('small')}
            className={!isCustom && currentConfig.bottleSize === 0.5 ? 'bg-mywater-blue h-8' : 'h-8'}
          >
            0.5L
          </Button>
          
          <Button 
            variant={!isCustom && currentConfig.bottleSize === 1.0 ? "default" : "outline"}
            size="sm"
            onClick={() => applyPreset('medium')}
            className={!isCustom && currentConfig.bottleSize === 1.0 ? 'bg-mywater-blue h-8' : 'h-8'}
          >
            1.0L
          </Button>
          
          <Button 
            variant={!isCustom && currentConfig.bottleSize === 1.5 ? "default" : "outline"}
            size="sm"
            onClick={() => applyPreset('large')}
            className={!isCustom && currentConfig.bottleSize === 1.5 ? 'bg-mywater-blue h-8' : 'h-8'}
          >
            1.5L
          </Button>
          
          <Button 
            variant={isCustom ? "default" : "outline"}
            size="sm"
            onClick={() => applyPreset('custom')}
            className={isCustom ? 'bg-mywater-blue h-8' : 'h-8'}
          >
            Custom
          </Button>
        </div>
      </div>
      
      <Card className="bg-spotify-darker">
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-1.5">
            <label className="text-xs w-28 text-gray-400">Bottle Size (L)</label>
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
            <label className="text-xs w-28 text-gray-400">Bottle Cost (€)</label>
            <input 
              type="number"
              min="0.1"
              step="0.01"
              value={bottleCost}
              onChange={(e) => setBottleCost(e.target.value)}
              className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          
          <div className="flex items-center gap-1.5">
            <label className="text-xs w-28 text-gray-400">CO₂ per Bottle (g)</label>
            <input 
              type="number"
              min="1"
              step="0.1"
              value={co2PerBottle}
              onChange={(e) => setCo2PerBottle(e.target.value)}
              className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center mt-4">
        <Button 
          onClick={handleApplySettings}
          className="bg-mywater-blue hover:bg-mywater-blue/90"
        >
          Apply Settings
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 text-center mt-2">
        These settings are used to calculate your environmental and financial impact.
      </p>
    </div>
  );
}
