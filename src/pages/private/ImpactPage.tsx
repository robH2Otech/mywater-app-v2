
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ImpactLayout } from "@/components/dashboard/private/impact/ImpactLayout";
import { useAuthState } from "@/hooks/firebase/useAuthState";
import { useFirestoreUserData } from "@/hooks/dashboard/useFirestoreUserData";
import { useEffect } from "react";

export function ImpactPage() {
  const [userName, setUserName] = useState<string>("");
  
  // Auth and user data
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
    <div className="space-y-6">
      <Card className="p-4 md:p-6 bg-spotify-darker border-spotify-accent overflow-hidden">
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold">
              {userName ? `${userName}'s` : 'Your'} Impact Calculator
            </h2>
            <p className="text-gray-400 mt-1 text-sm md:text-base">
              See how MYWATER system helps you save the environment and money
            </p>
          </div>

          <ImpactLayout />
        </div>
      </Card>
    </div>
  );
}
