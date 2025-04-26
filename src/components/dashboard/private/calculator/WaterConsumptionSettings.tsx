
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { motion } from "framer-motion";

interface ConsumptionConfig {
  bottleSize: number;
  bottleCost: number;
  dailyIntake: number;
}

interface WaterConsumptionSettingsProps {
  config: ConsumptionConfig;
  onConfigChange: (config: Partial<ConsumptionConfig>) => void;
}

export function WaterConsumptionSettings({ config, onConfigChange }: WaterConsumptionSettingsProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleChange = (changes: Partial<ConsumptionConfig>) => {
    const newConfig = { ...localConfig, ...changes };
    setLocalConfig(newConfig);
    setHasChanges(true);
  };

  const handleSave = () => {
    onConfigChange(localConfig);
    setHasChanges(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-4 bg-spotify-dark/50 rounded-lg"
    >
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">My Water Consumption</h3>
        <p className="text-sm text-gray-400">Customize your settings to get accurate impact calculations</p>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="daily-water">Daily Water Consumption</Label>
            <span className="text-sm font-medium">{localConfig.dailyIntake} L</span>
          </div>
          <Slider
            id="daily-water"
            min={0.5}
            max={5}
            step={0.1}
            value={[localConfig.dailyIntake]}
            onValueChange={value => handleChange({ dailyIntake: value[0] })}
            className="cursor-pointer"
          />
          <p className="text-xs text-gray-400">Recommended daily intake: 2-3 liters</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bottle-size">Bottle Size</Label>
            <Select 
              value={localConfig.bottleSize?.toString()} 
              onValueChange={value => handleChange({ bottleSize: parseFloat(value) })}
            >
              <SelectTrigger id="bottle-size" className="w-full">
                <SelectValue placeholder="Select bottle size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5L Bottle</SelectItem>
                <SelectItem value="1.0">1.0L Bottle</SelectItem>
                <SelectItem value="1.5">1.5L Bottle</SelectItem>
                <SelectItem value="2.0">2.0L Bottle</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bottle-cost">Bottle Cost (€)</Label>
            <Select 
              value={localConfig.bottleCost?.toString()} 
              onValueChange={value => handleChange({ bottleCost: parseFloat(value) })}
            >
              <SelectTrigger id="bottle-cost" className="w-full">
                <SelectValue placeholder="Select bottle cost" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.8">€0.80</SelectItem>
                <SelectItem value="1.0">€1.00</SelectItem>
                <SelectItem value="1.1">€1.10</SelectItem>
                <SelectItem value="1.5">€1.50</SelectItem>
                <SelectItem value="2.0">€2.00</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <motion.div 
          whileHover={{ scale: hasChanges ? 1.02 : 1 }}
          whileTap={{ scale: hasChanges ? 0.98 : 1 }}
        >
          <Button 
            onClick={handleSave}
            className={`w-full ${hasChanges ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-700"} mt-4`}
            disabled={!hasChanges}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </motion.div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="co2-value">CO₂ per Bottle (g)</Label>
            <div className="bg-gray-700/50 p-2 rounded-md text-center">
              <span className="text-sm font-medium">
                {(localConfig.bottleSize * 321).toFixed(1)}g
              </span>
            </div>
            <p className="text-xs text-gray-400">Based on 321g CO₂ per liter</p>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="plastic-value">Plastic per Bottle (g)</Label>
            <div className="bg-gray-700/50 p-2 rounded-md text-center">
              <span className="text-sm font-medium">
                {(localConfig.bottleSize * 40).toFixed(1)}g
              </span>
            </div>
            <p className="text-xs text-gray-400">Based on 40g plastic per liter</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
