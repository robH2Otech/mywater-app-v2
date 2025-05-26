
import { useState, useCallback } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
      console.log("🔄 Processing auth state change for:", firebaseUser.email);
      
      // Step 1: Fetch user document from Firestore first
      const userDocRef = doc(db, "app_users_business", firebaseUser.uid);
      let userDoc = await getDoc(userDocRef);
      let userData: AppUser | null = null;
      
      if (userDoc.exists()) {
        userData = userDoc.data() as AppUser;
        console.log("✅ Business user document found:", userData);
      } else {
        // Try private users collection
        const privateUserDocRef = doc(db, "app_users_privat", firebaseUser.uid);
        const privateUserDoc = await getDoc(privateUserDocRef);
        
        if (privateUserDoc.exists()) {
          userData = privateUserDoc.data() as AppUser;
          console.log("✅ Private user document found:", userData);
        } else {
          console.log("❌ No user document found, creating default business user");
          
          // Create a default business user document
          const defaultUserData: AppUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            first_name: firebaseUser.displayName?.split(' ')[0] || '',
            last_name: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
            role: 'user' as UserRole,
            company: 'mywater',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          await setDoc(userDocRef, defaultUserData);
          userData = defaultUserData;
          console.log("✅ Created default user document:", defaultUserData);
        }
      }
      
      // Step 2: Try to verify or refresh user claims (non-blocking)
      try {
        let { hasValidClaims, role, company: claimedCompany } = await verifyUserClaims();
        
        if (!hasValidClaims && userData) {
          console.log("⚠️ No valid claims found, attempting refresh...");
          await refreshUserClaims();
          const refreshResult = await verifyUserClaims();
          hasValidClaims = refreshResult.hasValidClaims;
          role = refreshResult.role;
          claimedCompany = refreshResult.company;
        }
        
        // Use claims if available, otherwise fall back to Firestore data
        if (hasValidClaims && role) {
          console.log("🎫 Using role from claims:", role);
          setUserRole(role as UserRole);
          setCompany(claimedCompany || userData.company || 'mywater');
        } else {
          console.log("📄 Using role from Firestore:", userData.role);
          setUserRole(userData.role as UserRole);
          setCompany(userData.company || 'mywater');
        }
      } catch (claimsError) {
        console.log("⚠️ Claims verification failed, using Firestore data only:", claimsError);
        setUserRole(userData.role as UserRole);
        setCompany(userData.company || 'mywater');
      }
      
      // Step 3: Set user data
      setCurrentUser({ id: firebaseUser.uid, ...userData });
      
      // Step 4: Log successful authentication
      logAuditEvent('user_authenticated', {
        user_id: firebaseUser.uid,
        email: firebaseUser.email,
        role: userData.role,
        company: userData.company,
        source: 'auth_state_change'
      });
      
    } catch (error) {
      console.error("❌ Error processing auth state change:", error);
      setCurrentUser(null);
      setUserRole(null);
      setCompany(null);
    }
  }, []);

  const refreshUserSession = useCallback(async (): Promise<boolean> => {
    try {
      if (!firebaseUser) {
        console.log("❌ No firebase user to refresh");
        return false;
      }
      
      console.log("🔄 Refreshing user session for:", firebaseUser.email);
      
      // Force token refresh
      await firebaseUser.getIdToken(true);
      
      // Try to refresh claims
      const refreshed = await refreshUserClaims();
      console.log("🎫 Claims refresh result:", refreshed);
      
      // Re-process auth state
      await handleAuthStateChange(firebaseUser);
      return true;
      
    } catch (error) {
      console.error("❌ Error refreshing user session:", error);
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
