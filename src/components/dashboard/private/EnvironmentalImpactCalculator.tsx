
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Waves, Recycle, Leaf, Coins, Award } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImpactCard } from "./impact/ImpactCard";
import { ImpactTabs } from "./impact/ImpactTabs";
import { useImpactCalculations, ImpactConfig } from "@/hooks/dashboard/useImpactCalculations";
import { useFirestoreUserData } from "@/hooks/dashboard/useFirestoreUserData";
import { useAuthState } from "@/hooks/firebase/useAuthState";

export function EnvironmentalImpactCalculator() {
  const [period, setPeriod] = useState<"week" | "month" | "year" | "all-time">("year");
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

  // Format numbers with specified decimal places
  const formatBottles = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const formatMoney = (value: number) => `€${value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
  const formatWeight = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 });

  return (
    <Card className="p-3 md:p-5 bg-spotify-darker border-spotify-accent overflow-hidden">
      <div className="space-y-2 md:space-y-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-center">
            {userName ? `${userName}'s` : 'Your'} Impact Calculator
          </h2>
          <p className="text-gray-400 text-center text-sm md:text-base mt-1">
            See how MYWATER system helps you save
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
          <div>
            {/* Impact Cards Grid - More compact for mobile */}
            <div className="grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-4 mt-2">
              <ImpactCard
                title="Bottles Saved"
                value={formatBottles(bottlesSaved)}
                icon={Waves}
                className="bg-spotify-accent/20"
                iconColor="text-blue-400" 
                compactMode={isMobile}
              />
              <ImpactCard
                title="Money Saved"
                value={formatMoney(moneySaved)}
                icon={Coins}
                className="bg-spotify-accent/20"
                iconColor="text-amber-400"
                compactMode={isMobile}
              />
              <ImpactCard
                title="CO₂ Reduced"
                value={`${formatWeight(co2Saved)} kg`}
                icon={Leaf}
                className="bg-spotify-accent/20"
                iconColor="text-emerald-400"
                compactMode={isMobile}
              />
              <ImpactCard
                title="Plastic Saved"
                value={`${formatWeight(plasticSaved)} kg`}
                icon={Recycle}
                className="bg-spotify-accent/20"
                iconColor="text-green-400"
                compactMode={isMobile}
              />
            </div>

            {/* User badges for gamification */}
            <div className="flex justify-center flex-wrap gap-2 mt-3">
              {bottlesSaved >= 100 && (
                <div className="flex items-center bg-gradient-to-r from-blue-500 to-cyan-500 px-2 py-0.5 rounded-full">
                  <Award className="h-3 w-3 mr-1" />
                  <span className="text-xs font-medium">100+ Bottles</span>
                </div>
              )}
              {bottlesSaved >= 500 && (
                <div className="flex items-center bg-gradient-to-r from-green-500 to-emerald-500 px-2 py-0.5 rounded-full">
                  <Award className="h-3 w-3 mr-1" />
                  <span className="text-xs font-medium">500+ Bottles</span>
                </div>
              )}
              {bottlesSaved >= 1000 && (
                <div className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 rounded-full">
                  <Award className="h-3 w-3 mr-1" />
                  <span className="text-xs font-medium">1000+ Bottles</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
