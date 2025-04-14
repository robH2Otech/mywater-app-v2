
import { useState, useEffect } from "react";
import { ImpactCalculatorContent } from "@/components/dashboard/private/impact/ImpactCalculatorContent";
import { useFirestoreUserData } from "@/hooks/dashboard/useFirestoreUserData";
import { useAuthState } from "@/hooks/firebase/useAuthState";

export function ImpactPage() {
  const [period, setPeriod] = useState<"day" | "month" | "year" | "all-time">("month");
  const [config, setConfig] = useState({
    bottleSize: 0.5, // Default to 0.5L bottles
    bottleCost: 1.10, // Default to €1.10 per bottle
    userType: "home" as const // Always home user
  });
  const [userName, setUserName] = useState("");
  
  const { fetchUserData } = useFirestoreUserData();
  const { user } = useAuthState();
  
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
  
  const handleConfigChange = (newConfig: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <ImpactCalculatorContent 
        period={period}
        setPeriod={setPeriod}
        config={config}
        onConfigChange={handleConfigChange}
        userName={userName}
      />
    </div>
  );
}
