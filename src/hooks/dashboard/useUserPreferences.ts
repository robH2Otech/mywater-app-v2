
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useAuthState } from "@/hooks/firebase/useAuthState";
import { useState, useEffect } from "react";

interface UserPreferences {
  dailyIntake: number;
  bottleSize: number;
  bottleCost: number;
}

export function useUserPreferences() {
  const { user } = useAuthState();
  const [preferences, setPreferences] = useState<UserPreferences>({
    dailyIntake: 2.0,
    bottleSize: 0.5,
    bottleCost: 1.1
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, "app_users_privat", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setPreferences({
            dailyIntake: data.daily_intake || 2.0,
            bottleSize: data.bottle_size || 0.5,
            bottleCost: data.bottle_cost || 1.1
          });
        }
      } catch (error) {
        console.error("Error loading user preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  const savePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user?.uid) return;
    
    try {
      await updateDoc(doc(db, "app_users_privat", user.uid), {
        daily_intake: newPreferences.dailyIntake,
        bottle_size: newPreferences.bottleSize,
        bottle_cost: newPreferences.bottleCost,
        updated_at: new Date()
      });
      
      setPreferences(prev => ({
        ...prev,
        ...newPreferences
      }));
      
      return true;
    } catch (error) {
      console.error("Error saving preferences:", error);
      return false;
    }
  };

  return { preferences, loading, savePreferences };
}
