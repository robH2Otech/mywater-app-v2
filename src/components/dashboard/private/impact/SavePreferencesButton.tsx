
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImpactConfig } from "@/hooks/dashboard/useImpactCalculations";

interface SavePreferencesButtonProps {
  config: Partial<ImpactConfig>;
}

export function SavePreferencesButton({ config }: SavePreferencesButtonProps) {
  const handleSavePreferences = () => {
    // Ensure we have required properties before saving
    if (config.bottleSize !== undefined && config.bottleCost !== undefined) {
      localStorage.setItem('waterConsumptionPreferences', JSON.stringify(config));
      toast.success('Preferences saved successfully!');
    } else {
      toast.error('Unable to save preferences: missing required values');
    }
  };

  return (
    <Button 
      onClick={handleSavePreferences}
      className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
    >
      Save Preferences
    </Button>
  );
}
