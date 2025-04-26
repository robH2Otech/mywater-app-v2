
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

  // Load preferences from localStorage on mount
  useEffect(() => {
    const loadPreferences = () => {
      setIsLoading(true);
      try {
        const storedPreferences = localStorage.getItem('waterConsumptionPreferences');
        if (storedPreferences) {
          const parsedPreferences = JSON.parse(storedPreferences);
          setPreferences(parsedPreferences);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreferences();
  }, []);

  // Save preferences to localStorage
  const savePreferences = (newPreferences: Partial<CalculatorPreferences>) => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      localStorage.setItem('waterConsumptionPreferences', JSON.stringify(updatedPreferences));
      setPreferences(updatedPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  return {
    preferences,
    isLoading,
    savePreferences
  };
}
