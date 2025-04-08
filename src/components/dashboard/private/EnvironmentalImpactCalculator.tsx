
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Waves, Recycle, Leaf, Coins } from "lucide-react";
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
  
  const isMobile = useIsMobile();
  const { fetchUserData } = useFirestoreUserData();
  const { user } = useAuthState();
  
  // Fetch user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.uid) {
        const userData = await fetchUserData(user.uid);
        if (userData) {
          setUserName(userData.displayName || "");
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
          <h2 className="text-xl md:text-2xl font-bold text-center">My Environmental Impact</h2>
          <p className="text-gray-400 text-center text-sm md:text-base mt-1">
            See how your MYWATER system helps you {userName || 'save the planet'}
          </p>
        </div>

        <ImpactTabs 
          period={period} 
          setPeriod={setPeriod} 
          config={config}
          onConfigChange={handleConfigChange}
        />

        {/* Impact Cards Grid - More responsive for mobile */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <ImpactCard
            title="My Bottles Saved"
            value={bottlesSaved.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 })}
            icon={Waves}
            className="bg-spotify-accent/20"
          />
          <ImpactCard
            title="My Money Saved"
            value={`€${moneySaved.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`}
            icon={Coins}
            className="bg-spotify-accent/20"
            iconColor="text-amber-400"
          />
          <ImpactCard
            title="My CO₂ Reduced"
            value={`${co2Saved.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 })} kg`}
            icon={Leaf}
            className="bg-spotify-accent/20"
            iconColor="text-emerald-400"
          />
          <ImpactCard
            title="My Plastic Saved"
            value={`${plasticSaved.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 })} kg`}
            icon={Recycle}
            className="bg-spotify-accent/20"
            iconColor="text-green-400"
          />
        </div>
      </div>
    </Card>
  );
}
