
import { useState, useEffect } from "react";
import { ImpactCalculatorContent } from "@/components/dashboard/private/impact/ImpactCalculatorContent";
import { useFirestoreUserData } from "@/hooks/dashboard/useFirestoreUserData";
import { useAuthState } from "@/hooks/firebase/useAuthState";

export function ImpactPage() {
  const [period, setPeriod] = useState<"day" | "month" | "year" | "all-time">("year");
  const [config, setConfig] = useState({
    bottleSize: 0.5,  // Default to 0.5L bottles
    bottleCost: 1.10, // Default to €1.10 per bottle
    userType: "home" as const  // Explicitly typed as "home" literal
  });
  
  const { user } = useAuthState();
  const { fetchUserData } = useFirestoreUserData();
  const [userName, setUserName] = useState<string>("");
  
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
  
  const handleConfigChange = (newConfig: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
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
