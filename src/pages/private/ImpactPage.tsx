
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useImpactCalculations } from "@/hooks/dashboard/useImpactCalculations";
import { useFirestoreUserData } from "@/hooks/dashboard/useFirestoreUserData";
import { useAuthState } from "@/hooks/firebase/useAuthState";
import { ImpactLayout } from "@/components/dashboard/private/impact/ImpactLayout";

export function ImpactPage() {
  // User data state
  const [userName, setUserName] = useState<string>("");
  const { user } = useAuthState();
  const { fetchUserData } = useFirestoreUserData();
  
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

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-spotify-darker border-spotify-accent overflow-hidden">
        <ImpactLayout userName={userName} />
      </Card>
    </div>
  );
}
