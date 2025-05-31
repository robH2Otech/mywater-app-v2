
import { useState, useCallback } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { AppUser, UserRole } from "@/types/users";
import { logAuditEvent } from "@/utils/auth/securityUtils";

export function useAuthStateManager(firebaseUser: FirebaseUser | null) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [company, setCompany] = useState<string | null>(null);

  const handleAuthStateChange = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      console.log("🔄 Processing auth state change for:", firebaseUser.email);
      
      // First, try to get user claims from Firebase Auth token
      const idTokenResult = await firebaseUser.getIdTokenResult();
      const roleFromClaims = idTokenResult.claims.role as UserRole;
      const companyFromClaims = idTokenResult.claims.company as string;
      
      console.log("Claims from token:", { role: roleFromClaims, company: companyFromClaims });
      
      // If we have valid claims, use them as fallback
      if (roleFromClaims && companyFromClaims) {
        const fallbackUser: AppUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          first_name: firebaseUser.displayName?.split(' ')[0] || '',
          last_name: firebaseUser.displayName?.split(' ')[1] || '',
          role: roleFromClaims,
          company: companyFromClaims,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setCurrentUser(fallbackUser);
        setUserRole(roleFromClaims);
        setCompany(companyFromClaims);
        
        console.log("✅ Using claims as fallback user data:", fallbackUser);
        
        // Try to fetch from Firestore, but don't fail if it doesn't work
        try {
          const userDocRef = doc(db, "app_users_business", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as AppUser;
            console.log("✅ Firestore user document found, updating data:", userData);
            
            setCurrentUser({ id: firebaseUser.uid, ...userData });
            setUserRole(userData.role as UserRole);
            setCompany(userData.company || companyFromClaims);
          }
        } catch (firestoreError) {
          console.warn("⚠️ Could not fetch from Firestore, using claims data:", firestoreError);
          // Continue with claims data - don't fail
        }
        
        // Log successful authentication
        logAuditEvent('user_authenticated', {
          user_id: firebaseUser.uid,
          email: firebaseUser.email,
          role: roleFromClaims,
          company: companyFromClaims,
          source: 'auth_state_change'
        });
        
        return;
      }
      
      // If no claims, try Firestore as before
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
          console.log("❌ No user document found in either collection");
          setCurrentUser(null);
          setUserRole(null);
          setCompany(null);
          return;
        }
      }
      
      // Set user data
      setCurrentUser({ id: firebaseUser.uid, ...userData });
      setUserRole(userData.role as UserRole);
      setCompany(userData.company || 'mywater');
      
      // Log successful authentication
      logAuditEvent('user_authenticated', {
        user_id: firebaseUser.uid,
        email: firebaseUser.email,
        role: userData.role,
        company: userData.company,
        source: 'auth_state_change'
      });
      
    } catch (error) {
      console.error("❌ Error processing auth state change:", error);
      
      // Try to extract user data from Firebase user object as last resort
      if (firebaseUser.email) {
        console.log("🔄 Using Firebase user data as last resort");
        
        const emergencyUser: AppUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          first_name: firebaseUser.displayName?.split(' ')[0] || 'User',
          last_name: firebaseUser.displayName?.split(' ')[1] || '',
          role: 'user' as UserRole,
          company: 'mywater',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setCurrentUser(emergencyUser);
        setUserRole('user');
        setCompany('mywater');
        
        console.log("✅ Emergency user data set:", emergencyUser);
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setCompany(null);
      }
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
