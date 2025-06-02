
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
      // Set default values first
      let roleFromClaims: UserRole | null = null;
      let companyFromClaims: string | null = null;

      // Try to get user claims, but don't fail if they're missing
      try {
        const idTokenResult = await user.getIdTokenResult();
        roleFromClaims = idTokenResult.claims.role as UserRole;
        companyFromClaims = idTokenResult.claims.company as string;
      } catch (claimsError) {
        console.log("Could not get claims, using fallback values:", claimsError);
      }

      // If no claims, provide fallback role based on email pattern
      if (!roleFromClaims) {
        if (user.email?.includes('admin') || user.email?.includes('superadmin')) {
          roleFromClaims = 'admin';
          companyFromClaims = 'MyWater';
        } else {
          roleFromClaims = 'user';
          companyFromClaims = 'MyWater';
        }
        console.log("Using fallback role and company:", roleFromClaims, companyFromClaims);
      }

      // Set role and company
      setUserRole(roleFromClaims);
      setCompany(companyFromClaims);

      // Try to get user document, but don't fail if it doesn't exist
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
            role: roleFromClaims,
            company: companyFromClaims,
            status: userData.status || 'active',
            ...userData
          } as AppUser);
        } else {
          // Create minimal user object from Firebase user
          setCurrentUser({
            id: user.uid,
            email: user.email || '',
            first_name: user.displayName?.split(' ')[0] || '',
            last_name: user.displayName?.split(' ').slice(1).join(' ') || '',
            role: roleFromClaims,
            company: companyFromClaims,
            status: 'active'
          } as AppUser);
        }
      } catch (docError) {
        console.log("Could not get user document, using minimal user data:", docError);
        // Create minimal user object
        setCurrentUser({
          id: user.uid,
          email: user.email || '',
          first_name: user.displayName?.split(' ')[0] || '',
          last_name: user.displayName?.split(' ').slice(1).join(' ') || '',
          role: roleFromClaims,
          company: companyFromClaims,
          status: 'active'
        } as AppUser);
      }
    } catch (error) {
      console.error("Error in handleAuthStateChange:", error);
      // Even if there's an error, provide basic user info
      setCurrentUser({
        id: user.uid,
        email: user.email || '',
        first_name: '',
        last_name: '',
        role: 'user',
        company: 'MyWater',
        status: 'active'
      } as AppUser);
      setUserRole('user');
      setCompany('MyWater');
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
