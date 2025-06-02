
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
      // Get user claims with retry mechanism
      let roleFromClaims: UserRole | null = null;
      let companyFromClaims: string | null = null;

      try {
        const idTokenResult = await user.getIdTokenResult();
        roleFromClaims = idTokenResult.claims.role as UserRole;
        companyFromClaims = idTokenResult.claims.company as string;
        
        console.log("useAuthStateManager: Got claims from token:", { role: roleFromClaims, company: companyFromClaims });
      } catch (claimsError) {
        console.log("useAuthStateManager: Could not get claims:", claimsError);
      }

      // Set role and company (use fallback if needed)
      setUserRole(roleFromClaims || 'user');
      setCompany(companyFromClaims || 'X-WATER');

      // Try to get user document from Firestore
      try {
        const userDocRef = doc(db, "app_users_business", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({
            id: user.uid,
            email: user.email || '',
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            role: roleFromClaims || userData.role || 'user',
            company: companyFromClaims || userData.company || 'X-WATER',
            status: userData.status || 'active',
            ...userData
          } as AppUser);
        } else {
          // Create minimal user object
          setCurrentUser({
            id: user.uid,
            email: user.email || '',
            first_name: user.displayName?.split(' ')[0] || '',
            last_name: user.displayName?.split(' ').slice(1).join(' ') || '',
            role: roleFromClaims || 'user',
            company: companyFromClaims || 'X-WATER',
            status: 'active'
          } as AppUser);
        }
      } catch (docError) {
        console.log("useAuthStateManager: Could not get user document:", docError);
        // Create minimal user object as fallback
        setCurrentUser({
          id: user.uid,
          email: user.email || '',
          first_name: user.displayName?.split(' ')[0] || '',
          last_name: user.displayName?.split(' ').slice(1).join(' ') || '',
          role: roleFromClaims || 'user',
          company: companyFromClaims || 'X-WATER',
          status: 'active'
        } as AppUser);
      }
    } catch (error) {
      console.error("useAuthStateManager: Error in handleAuthStateChange:", error);
      // Provide basic user info as last resort
      setCurrentUser({
        id: user.uid,
        email: user.email || '',
        first_name: '',
        last_name: '',
        role: 'user',
        company: 'X-WATER',
        status: 'active'
      } as AppUser);
      setUserRole('user');
      setCompany('X-WATER');
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
    userRole: userRole as UserRole | null,
    company,
    refreshUserSession,
    handleAuthStateChange
  };
}
