
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Calculator as CalculatorIcon } from "lucide-react";
import { ImpactCalculator } from "@/components/dashboard/private/calculator/ImpactCalculator";
import { useFirestoreUserData } from "@/hooks/dashboard/useFirestoreUserData";
import { useAuthState } from "@/hooks/firebase/useAuthState";

export function CalculatorPage() {
  const [userName, setUserName] = useState<string>("");
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

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Impact Calculator" 
        description="Calculate your environmental and financial impact"
        icon={CalculatorIcon}
      />
      
      <ImpactCalculator userName={userName} />
    </div>
  );
}
