
import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { useAuthState } from '@/hooks/firebase/useAuthState';

export interface UserPreferences {
  bottleSize: number;
  bottleCost: number;
  dailyIntake: number;
}

export function useUserPreferences() {
  const { user } = useAuthState();
  const [preferences, setPreferences] = useState<UserPreferences>({
    bottleSize: 0.5,
    bottleCost: 1.10,
    dailyIntake: 2.0
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.uid) return;
      
      try {
        const prefsDoc = await getDoc(doc(db, "user_preferences", user.uid));
        if (prefsDoc.exists()) {
          setPreferences(prefsDoc.data() as UserPreferences);
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };

    loadPreferences();
  }, [user]);

  const savePreferences = async (newPrefs: Partial<UserPreferences>) => {
    if (!user?.uid) return;
    
    setIsSaving(true);
    try {
      const updatedPrefs = { ...preferences, ...newPrefs };
      await setDoc(doc(db, "user_preferences", user.uid), updatedPrefs);
      setPreferences(updatedPrefs);
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return { preferences, savePreferences, isSaving };
}
