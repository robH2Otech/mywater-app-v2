
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Waves, Recycle, Leaf, Coins, Award, Target } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImpactCard } from "./impact/ImpactCard";
import { ImpactTabs } from "./impact/ImpactTabs";
import { useImpactCalculations, ImpactConfig } from "@/hooks/dashboard/useImpactCalculations";
import { useFirestoreUserData } from "@/hooks/dashboard/useFirestoreUserData";
import { auth } from "@/integrations/firebase/client";
import { useAuthState } from "@/hooks/firebase/useAuthState";

export function EnvironmentalImpactCalculator() {
  const [period, setPeriod] = useState<"day" | "month" | "year" | "all-time">("year");
  const [config, setConfig] = useState<Partial<ImpactConfig>>({
    bottleSize: 0.5,  // Default to 0.5L bottles
    bottleCost: 1.10, // Default to €1.10 per bottle
    userType: 'home'  // Always home user
  });
  const [userName, setUserName] = useState<string>("");
  const [activeTab, setActiveTab] = useState("environmental");
  
  const isMobile = useIsMobile();
  const { fetchUserData } = useFirestoreUserData();
  const { user } = useAuthState();
  
  // Fetch user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.uid) {
        const userData = await fetchUserData(user.uid);
        if (userData) {
          setUserName(userData.first_name || '');
        }
      }
    };
    
    loadUserData();
  }, [user, fetchUserData]);
  
  const { 
    bottlesSaved, 
    waterSaved, 
    plasticSaved, 
    co2Saved, 
    moneySaved,
    impactDetails,
    equivalents
  } = useImpactCalculations(period, config);

  const handleConfigChange = (newConfig: Partial<ImpactConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  return (
    <Card className="p-4 md:p-6 bg-spotify-darker border-spotify-accent">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-center">Impact Calculator</h2>
          <p className="text-gray-400 text-center text-sm md:text-base mt-1">
            See how your MYWATER system helps {userName || 'you'} save the planet
          </p>
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
          <div className="space-y-6">
            {/* Impact Cards Grid - More responsive for mobile */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
              <ImpactCard
                title="Bottles Saved"
                value={bottlesSaved.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 })}
                icon={Waves}
                className="bg-spotify-accent/20"
              />
              <ImpactCard
                title="Water Filtered"
                value={`${waterSaved.toLocaleString(undefined, { maximumFractionDigits: 1 })} L`}
                icon={Waves}
                className="bg-spotify-accent/20"
                iconColor="text-blue-400"
              />
              <ImpactCard
                title="CO₂ Reduced"
                value={`${co2Saved.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 })} kg`}
                icon={Leaf}
                className="bg-spotify-accent/20"
                iconColor="text-emerald-400"
              />
              <ImpactCard
                title="Plastic Saved"
                value={`${plasticSaved.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 })} kg`}
                icon={Recycle}
                className="bg-spotify-accent/20"
                iconColor="text-green-400"
              />
            </div>

            {/* User badges for gamification */}
            <div className="flex justify-center flex-wrap gap-3 mt-4">
              {bottlesSaved >= 100 && (
                <div className="flex items-center bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-1 rounded-full">
                  <Award className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">100+ Bottles Saved</span>
                </div>
              )}
              {bottlesSaved >= 500 && (
                <div className="flex items-center bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 rounded-full">
                  <Award className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">500+ Bottles Saved</span>
                </div>
              )}
              {bottlesSaved >= 1000 && (
                <div className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full">
                  <Award className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">1000+ Bottles Saved</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
