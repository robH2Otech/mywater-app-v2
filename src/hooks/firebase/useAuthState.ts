
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";
import { refreshUserClaims, verifyUserClaims } from "@/utils/admin/adminClaimsManager";

/**
 * Hook to track Firebase authentication state
 */
export function useAuthState() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [claimsVerified, setClaimsVerified] = useState(false);

  // Check if user is already authenticated and verify claims
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        console.log("User authenticated:", currentUser.email);
        
        // Verify the user has proper claims
        const { hasValidClaims, role } = await verifyUserClaims();
        
        if (!hasValidClaims) {
          console.log("User missing valid claims, attempting refresh...");
          await refreshUserClaims();
          
          // Check claims again after refresh
          const refreshResult = await verifyUserClaims();
          setClaimsVerified(refreshResult.hasValidClaims);
        } else {
          console.log("User has valid claims with role:", role);
          setClaimsVerified(true);
        }
        
        navigate("/private-dashboard");
      } else {
        // Reset state when logged out
        setClaimsVerified(false);
      }
      
      setAuthChecked(true);
    });
    
    return () => unsubscribe();
  }, [navigate]);

  return {
    user,
    authChecked,
    claimsVerified,
    isAuthenticated: !!user
  };
}
