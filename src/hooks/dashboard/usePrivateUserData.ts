
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/integrations/firebase/client";
import { PrivateUser } from "@/types/privateUser";
import { useFirestoreUserData } from "./useFirestoreUserData";
import { useCartridgeCalculations } from "./useCartridgeCalculations";

export function usePrivateUserData() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<PrivateUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { fetchUserData } = useFirestoreUserData();
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        
        if (!user) {
          navigate("/private-auth");
          return;
        }
        
        const userDataResult = await fetchUserData(user.uid);
        console.log("usePrivateUserData - Fetched user data:", userDataResult);
        
        if (userDataResult) {
          // Log specifically to check for referral code
          console.log("usePrivateUserData - referral_code:", userDataResult.referral_code);
        }
        
        setUserData(userDataResult);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [navigate, fetchUserData]);

  const {
    daysUntilReplacement,
    isReplacementDueSoon,
    isReplacementOverdue,
    formattedReplacementDate,
    cartridgeUsagePercent
  } = useCartridgeCalculations(userData);

  return {
    userData,
    loading,
    daysUntilReplacement,
    isReplacementDueSoon,
    isReplacementOverdue,
    formattedReplacementDate,
    cartridgeUsagePercent
  };
}
