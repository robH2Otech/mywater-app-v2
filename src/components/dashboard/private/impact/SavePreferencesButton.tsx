
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SavePreferencesButtonProps {
  config: {
    bottleSize: number;
    bottleCost: number;
    dailyIntake?: number;
  };
}

export function SavePreferencesButton({ config }: SavePreferencesButtonProps) {
  const handleSavePreferences = () => {
    localStorage.setItem('waterConsumptionPreferences', JSON.stringify(config));
    toast.success('Preferences saved successfully!');
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
