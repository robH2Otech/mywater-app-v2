
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useUserPreferences } from "@/hooks/dashboard/useUserPreferences";
import { toast } from "sonner";

export function WaterConsumptionSettings() {
  const { preferences, savePreferences } = useUserPreferences();
  const [localPreferences, setLocalPreferences] = useState({
    dailyIntake: 2.0,
    bottleSize: 0.5,
    bottleCost: 1.1
  });
  
  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handleSave = async () => {
    const success = await savePreferences(localPreferences);
    if (success) {
      toast.success("Settings saved successfully");
    } else {
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="space-y-6 p-4 bg-spotify-dark/50 rounded-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Calculate Your Impact</h3>
        <p className="text-sm text-gray-400">Customize your settings to see your environmental impact</p>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="daily-water">Daily Water Consumption</Label>
            <span className="text-sm font-medium">{localPreferences.dailyIntake} L</span>
          </div>
          <Slider
            id="daily-water"
            min={0.5}
            max={5}
            step={0.1}
            value={[localPreferences.dailyIntake]}
            onValueChange={value => setLocalPreferences(prev => ({ ...prev, dailyIntake: value[0] }))}
            className="cursor-pointer"
          />
          <p className="text-xs text-gray-400">Recommended daily intake: 2-3 liters</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bottle-size">Bottle Size</Label>
            <Select 
              value={localPreferences.bottleSize?.toString()} 
              onValueChange={value => setLocalPreferences(prev => ({ ...prev, bottleSize: parseFloat(value) }))}
            >
              <SelectTrigger id="bottle-size" className="w-full">
                <SelectValue placeholder="Select bottle size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5L Bottle</SelectItem>
                <SelectItem value="1.0">1.0L Bottle</SelectItem>
                <SelectItem value="1.5">1.5L Bottle</SelectItem>
                <SelectItem value="2.0">2.0L Bottle</SelectItem>
                <SelectItem value="3.0">3.0L Bottle</SelectItem>
                <SelectItem value="5.0">5.0L Bottle</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bottle-cost">Bottle Cost (€)</Label>
            <Select 
              value={localPreferences.bottleCost?.toString()} 
              onValueChange={value => setLocalPreferences(prev => ({ ...prev, bottleCost: parseFloat(value) }))}
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
        
        <Button 
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}
