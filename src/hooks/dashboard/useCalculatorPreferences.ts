
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface CalculatorPreferences {
  bottleSize: number;
  bottleCost: number;
  dailyIntake: number;
}

const DEFAULT_PREFERENCES: CalculatorPreferences = {
  bottleSize: 0.5,
  bottleCost: 1.10,
  dailyIntake: 2.0
};

export function useCalculatorPreferences() {
  const [preferences, setPreferences] = useState<CalculatorPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedPreferences = localStorage.getItem('waterConsumptionPreferences');
    if (storedPreferences) {
      try {
        setPreferences(JSON.parse(storedPreferences));
      } catch (error) {
        console.error('Error parsing stored preferences:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const savePreferences = (newPreferences: Partial<CalculatorPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    localStorage.setItem('waterConsumptionPreferences', JSON.stringify(updatedPreferences));
    setPreferences(updatedPreferences);
    toast.success('Preferences saved successfully!');
  };

  return {
    preferences,
    isLoading,
    savePreferences
  };
}
