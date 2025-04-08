
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FormInput } from "@/components/shared/FormInput";
import { Button } from "@/components/ui/button";
import { Check, User, Briefcase } from "lucide-react";
import { ImpactConfig } from "@/hooks/dashboard/useImpactCalculations";
import { BOTTLE_CONFIGS } from "@/utils/formatUnitVolume";

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
  const [userType, setUserType] = useState<'home' | 'business'>(currentConfig.userType || 'home');
  
  const handleApplySettings = () => {
    onConfigChange({
      bottleSize: parseFloat(bottleSize),
      bottleCost: parseFloat(bottleCost),
      co2PerBottle: parseFloat(co2PerBottle),
      plasticPerBottle: parseFloat(plasticPerBottle),
      dailyIntake: parseFloat(dailyIntake),
      userType
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
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">Impact Calculator Settings</h3>
        <p className="text-sm text-gray-400">Customize how your environmental impact is calculated</p>
      </div>
      
      {/* User Type Selection */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Button 
          variant={userType === 'home' ? "default" : "outline"}
          className={`flex items-center justify-center gap-2 h-12 ${userType === 'home' ? 'bg-mywater-blue text-white' : ''}`}
          onClick={() => setUserType('home')}
        >
          <User className="h-5 w-5" />
          Home User
          {userType === 'home' && <Check className="h-4 w-4 ml-1" />}
        </Button>
        
        <Button 
          variant={userType === 'business' ? "default" : "outline"}
          className={`flex items-center justify-center gap-2 h-12 ${userType === 'business' ? 'bg-mywater-blue text-white' : ''}`}
          onClick={() => setUserType('business')}
        >
          <Briefcase className="h-5 w-5" />
          Business User
          {userType === 'business' && <Check className="h-4 w-4 ml-1" />}
        </Button>
      </div>
      
      {/* Bottle Presets */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-2">Bottle Size Presets:</p>
        <div className="grid grid-cols-4 gap-2">
          <Button 
            variant={!isCustom && currentConfig.bottleSize === 0.5 ? "default" : "outline"}
            size="sm"
            onClick={() => applyPreset('small')}
            className={!isCustom && currentConfig.bottleSize === 0.5 ? 'bg-mywater-blue' : ''}
          >
            0.5L
          </Button>
          
          <Button 
            variant={!isCustom && currentConfig.bottleSize === 1.0 ? "default" : "outline"}
            size="sm"
            onClick={() => applyPreset('medium')}
            className={!isCustom && currentConfig.bottleSize === 1.0 ? 'bg-mywater-blue' : ''}
          >
            1.0L
          </Button>
          
          <Button 
            variant={!isCustom && currentConfig.bottleSize === 1.5 ? "default" : "outline"}
            size="sm"
            onClick={() => applyPreset('large')}
            className={!isCustom && currentConfig.bottleSize === 1.5 ? 'bg-mywater-blue' : ''}
          >
            1.5L
          </Button>
          
          <Button 
            variant={isCustom ? "default" : "outline"}
            size="sm"
            onClick={() => applyPreset('custom')}
            className={isCustom ? 'bg-mywater-blue' : ''}
          >
            Custom
          </Button>
        </div>
      </div>
      
      <Card className="bg-spotify-darker">
        <CardContent className="p-4 space-y-4">
          <FormInput
            label="Bottle Size (L)"
            value={bottleSize}
            onChange={setBottleSize}
            type="number"
            min="0.1"
            step="0.1"
          />
          
          <FormInput
            label="Bottle Cost (€)"
            value={bottleCost}
            onChange={setBottleCost}
            type="number"
            min="0.1"
            step="0.01"
          />
          
          <FormInput
            label="CO₂ per Bottle (g)"
            value={co2PerBottle}
            onChange={setCo2PerBottle}
            type="number"
            min="1"
            step="0.1"
          />
          
          <FormInput
            label="Plastic per Bottle (g)"
            value={plasticPerBottle}
            onChange={setPlasticPerBottle}
            type="number"
            min="1"
            step="0.1"
          />
          
          <FormInput
            label="Daily Water Intake Goal (L)"
            value={dailyIntake}
            onChange={setDailyIntake}
            type="number"
            min="0.1"
            step="0.1"
          />
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
