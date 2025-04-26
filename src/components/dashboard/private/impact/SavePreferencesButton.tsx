
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { ImpactConfig } from "@/hooks/dashboard/useImpactCalculations";
import { motion } from "framer-motion";

interface SavePreferencesButtonProps {
  config: Partial<ImpactConfig>;
  onSave: (config: Partial<ImpactConfig>) => void;
  className?: string;
}

export function SavePreferencesButton({ config, onSave, className }: SavePreferencesButtonProps) {
  const handleSavePreferences = () => {
    if (config.bottleSize !== undefined && config.bottleCost !== undefined) {
      onSave(config);
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button 
        onClick={handleSavePreferences}
        className={`w-full bg-blue-600 hover:bg-blue-700 mt-4 ${className || ""}`}
      >
        <Save className="w-4 h-4 mr-2" />
        Save Preferences
      </Button>
    </motion.div>
  );
}
