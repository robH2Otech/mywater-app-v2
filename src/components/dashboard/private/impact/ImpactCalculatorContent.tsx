
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Waves, Recycle, Leaf, Coins } from "lucide-react";
import { ImpactCard } from "./ImpactCard";
import { ImpactTabs } from "./ImpactTabs";
import { useImpactCalculations } from "@/hooks/dashboard/useImpactCalculations";
import { ImpactMetricsDisplay } from "./ImpactMetricsDisplay";
import { ImpactAchievementBadges } from "./ImpactAchievementBadges";
import { motion } from "framer-motion";
import { useAuthState } from "@/hooks/firebase/useAuthState";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

interface ImpactCalculatorContentProps {
  period: "week" | "month" | "year" | "all-time";
  setPeriod: (period: "week" | "month" | "year" | "all-time") => void;
  config: {
    bottleSize: number;
    bottleCost: number;
    userType: "home";
    dailyIntake?: number;
  };
  onConfigChange: (config: Partial<{
    bottleSize: number;
    bottleCost: number;
    userType: "home";
    dailyIntake?: number;
  }>) => void;
  userName: string;
}

export function ImpactCalculatorContent({ 
  period, 
  setPeriod, 
  config, 
  onConfigChange,
  userName 
}: ImpactCalculatorContentProps) {
  const [activeTab, setActiveTab] = useState("environmental");
  const { user } = useAuthState();

  const { 
    bottlesSaved, 
    waterSaved, 
    plasticSaved, 
    co2Saved, 
    moneySaved
  } = useImpactCalculations(period, config);

  // Load user settings from Firebase
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user?.uid) return;
      
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().waterSettings) {
          const settings = docSnap.data().waterSettings;
          onConfigChange({
            bottleSize: settings.bottleSize || config.bottleSize,
            bottleCost: settings.bottleCost || config.bottleCost,
            dailyIntake: settings.dailyIntake || config.dailyIntake
          });
        }
      } catch (error) {
        console.error("Error loading user settings:", error);
      }
    };
    
    loadUserSettings();
  }, [user, onConfigChange]);

  // Save user settings to Firebase
  const saveUserSettings = async (newSettings: Partial<typeof config>) => {
    if (!user?.uid) return;
    
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        await setDoc(docRef, {
          ...docSnap.data(),
          waterSettings: {
            ...(docSnap.data().waterSettings || {}),
            ...newSettings
          }
        }, { merge: true });
      } else {
        await setDoc(docRef, {
          waterSettings: newSettings
        });
      }
    } catch (error) {
      console.error("Error saving user settings:", error);
    }
  };

  // Handle config changes and save to Firebase
  const handleConfigChange = (newConfig: Partial<typeof config>) => {
    onConfigChange(newConfig);
    saveUserSettings(newConfig);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-6 bg-gradient-to-br from-spotify-darker via-slate-900/90 to-spotify-darker border-spotify-accent overflow-hidden">
          <div className="space-y-4">
            <div className="text-center">
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent"
              >
                {userName ? `${userName}'s` : 'Your'} Environmental Impact
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-400 mt-1.5"
              >
                See how MYWATER system helps you save
              </motion.p>
            </div>

            <ImpactTabs 
              period={period} 
              setPeriod={setPeriod} 
              config={config}
              onConfigChange={handleConfigChange}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {activeTab === "environmental" && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <ImpactMetricsDisplay 
                  bottlesSaved={bottlesSaved}
                  moneySaved={moneySaved}
                  co2Saved={co2Saved}
                  plasticSaved={plasticSaved}
                  bottleSize={config.bottleSize}
                  bottleCost={config.bottleCost}
                />
                
                <ImpactAchievementBadges bottlesSaved={bottlesSaved} />
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
