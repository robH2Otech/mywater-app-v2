
import { useState, useCallback } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/integrations/firebase/client";
import { AppUser, UserRole } from "@/types/users";

export function useAuthStateManager(firebaseUser: FirebaseUser | null) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [company, setCompany] = useState<string | null>(null);

  const handleAuthStateChange = useCallback(async (user: FirebaseUser | null) => {
    if (!user) {
      setCurrentUser(null);
      setUserRole(null);
      setCompany(null);
      return;
    }

    try {
      // Get user claims first
      const idTokenResult = await user.getIdTokenResult();
      const roleFromClaims = idTokenResult.claims.role as UserRole;
      const companyFromClaims = idTokenResult.claims.company as string;

      if (roleFromClaims) {
        // Set role and company from claims
        setUserRole(roleFromClaims as UserRole); // Explicitly cast to preserve full type
        setCompany(companyFromClaims);

        // Try to get user document
        const userDocRef = doc(db, "app_users_business", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({
            id: user.uid,
            email: user.email || '',
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            role: roleFromClaims as UserRole, // Preserve full type
            company: companyFromClaims,
            status: userData.status || 'active',
            ...userData
          } as AppUser);
        } else {
          // Create minimal user object from Firebase user
          setCurrentUser({
            id: user.uid,
            email: user.email || '',
            first_name: '',
            last_name: '',
            role: roleFromClaims as UserRole, // Preserve full type
            company: companyFromClaims,
            status: 'active'
          } as AppUser);
        }
      }
    } catch (error) {
      console.error("Error in handleAuthStateChange:", error);
    }
  }, []);

  const refreshUserSession = async (): Promise<boolean> => {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      await user.getIdToken(true);
      await handleAuthStateChange(user);
      return true;
    } catch (error) {
      console.error("Error refreshing user session:", error);
      return false;
    }
  };

  return {
    currentUser,
    userRole: userRole as UserRole | null, // Explicitly preserve full UserRole type
    company,
    refreshUserSession,
    handleAuthStateChange
  };
}
