
import { useState, useCallback } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { AppUser, UserRole } from "@/types/users";
import { verifyUserClaims, refreshUserClaims } from "@/utils/admin/adminClaimsManager";
import { logAuditEvent } from "@/utils/auth/securityUtils";

export function useAuthStateManager(firebaseUser: FirebaseUser | null) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [company, setCompany] = useState<string | null>(null);

  const handleAuthStateChange = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      console.log("Processing auth state change for:", firebaseUser.email);
      
      // Step 1: Verify or refresh user claims
      let { hasValidClaims, role, company: claimedCompany } = await verifyUserClaims();
      
      if (!hasValidClaims) {
        console.log("No valid claims found, attempting refresh...");
        await refreshUserClaims();
        const refreshResult = await verifyUserClaims();
        hasValidClaims = refreshResult.hasValidClaims;
        role = refreshResult.role;
        claimedCompany = refreshResult.company;
      }

      // Step 2: Fetch user document from Firestore
      const userDocRef = doc(db, "app_users_business", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as AppUser;
        console.log("User document found:", userData);
        
        // Step 3: Set user data
        setCurrentUser({ id: userDoc.id, ...userData });
        
        // Step 4: Use role from claims if available, otherwise from Firestore
        if (hasValidClaims && role) {
          console.log("Using role from claims:", role);
          setUserRole(role as UserRole);
          setCompany(claimedCompany || userData.company || 'mywater');
        } else {
          console.log("Using role from Firestore:", userData.role);
          setUserRole(userData.role as UserRole);
          setCompany(userData.company || 'mywater');
        }
        
        // Step 5: Log successful authentication
        logAuditEvent('user_authenticated', {
          user_id: firebaseUser.uid,
          email: firebaseUser.email,
          role: userRole,
          company: company
        });
      } else {
        console.error("User document not found for UID:", firebaseUser.uid);
        setCurrentUser(null);
        setUserRole(null);
        setCompany(null);
      }
    } catch (error) {
      console.error("Error processing auth state change:", error);
      setCurrentUser(null);
      setUserRole(null);
      setCompany(null);
    }
  }, []);

  const refreshUserSession = useCallback(async (): Promise<boolean> => {
    try {
      if (!firebaseUser) return false;
      
      console.log("Refreshing user session");
      const refreshed = await refreshUserClaims();
      
      if (refreshed) {
        await handleAuthStateChange(firebaseUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error refreshing user session:", error);
      return false;
    }
  }, [firebaseUser, handleAuthStateChange]);

  return {
    currentUser,
    userRole,
    company,
    refreshUserSession,
    handleAuthStateChange
  };
}
