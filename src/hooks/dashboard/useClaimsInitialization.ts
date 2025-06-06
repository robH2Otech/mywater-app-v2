
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { initializeUserClaims } from "@/utils/admin/adminClaimsManager";

export function useClaimsInitialization() {
  const [claimsInitialized, setClaimsInitialized] = useState<boolean>(false);
  const { userRole, refreshUserSession } = useAuth();
  
  // Initialize claims if missing
  useEffect(() => {
    const initializeClaims = async () => {
      if (!userRole && !claimsInitialized) {
        console.log("🔧 Index: No user role found, attempting to initialize claims...");
        try {
          const initialized = await initializeUserClaims();
          if (initialized) {
            console.log("✅ Index: Claims initialized, refreshing session...");
            await refreshUserSession();
          }
          setClaimsInitialized(true);
        } catch (error) {
          console.error("❌ Index: Error initializing claims:", error);
          setClaimsInitialized(true);
        }
      }
    };
    
    initializeClaims();
  }, [userRole, claimsInitialized, refreshUserSession]);

  return { claimsInitialized };
}
