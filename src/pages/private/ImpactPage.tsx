
import { useState, useEffect } from "react";
import { ImpactCalculatorContent } from "@/components/dashboard/private/impact/ImpactCalculatorContent";
import { useFirestoreUserData } from "@/hooks/dashboard/useFirestoreUserData";
import { useAuthState } from "@/hooks/firebase/useAuthState";

export function ImpactPage() {
  console.log("ImpactPage component is being RENDERED");
  
  const [period, setPeriod] = useState<"day" | "month" | "year" | "all-time">("month");
  const [config, setConfig] = useState({
    bottleSize: 0.5, // Default to 0.5L bottles
    bottleCost: 1.10, // Default to €1.10 per bottle
    userType: "home" as const // Always home user
  });
  const [userName, setUserName] = useState("");
  
  const { fetchUserData } = useFirestoreUserData();
  const { user } = useAuthState();
  
  // Fetch user data on component mount
  useEffect(() => {
    console.log("ImpactPage useEffect running to fetch user data");
    
    const loadUserData = async () => {
      if (user?.uid) {
        console.log("ImpactPage: Fetching user data for", user.uid);
        const userData = await fetchUserData(user.uid);
        if (userData) {
          setUserName(userData.first_name || '');
          console.log("ImpactPage: User data loaded successfully:", userData.first_name);
        } else {
          console.log("ImpactPage: No user data found");
        }
      }
    };
    
    loadUserData();
  }, [user, fetchUserData]);
  
  const handleConfigChange = (newConfig: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  // Add a debug message to the UI to confirm we're on the impact page
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-4 p-2 bg-primary/10 rounded-md text-center">
        <p className="text-sm text-primary">Impact Dashboard</p>
      </div>
      
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
