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
      
      // If we have valid claims, use them as the primary source
      if (roleFromClaims) {
        // Create user object from claims
        const claimsUser: AppUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          first_name: firebaseUser.displayName?.split(' ')[0] || 'User',
          last_name: firebaseUser.displayName?.split(' ')[1] || '',
          role: roleFromClaims,
          company: companyFromClaims,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Special handling for superadmin
        if (roleFromClaims === 'superadmin') {
          claimsUser.first_name = 'Super';
          claimsUser.last_name = 'Admin';
          claimsUser.company = 'mywater'; // Default company for superadmin
        }
        
        setCurrentUser(claimsUser);
        setUserRole(roleFromClaims);
        setCompany(companyFromClaims || 'mywater');
        
        console.log("✅ Using claims data:", claimsUser);
        
        // Try to fetch from Firestore for additional data, but don't fail if it doesn't work
        try {
          const userDocRef = doc(db, "app_users_business", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as AppUser;
            console.log("✅ Enhanced with Firestore data:", userData);
            
            // Merge Firestore data with claims, keeping claims as authoritative for role/company
            const enhancedUser = {
              ...userData,
              id: firebaseUser.uid,
              role: roleFromClaims, // Keep claims role as authoritative
              company: companyFromClaims || userData.company || 'mywater'
            };
            
            setCurrentUser(enhancedUser);
            setCompany(companyFromClaims || userData.company || 'mywater');
          } else if (roleFromClaims === 'superadmin') {
            // Create a profile document for superadmin if it doesn't exist
            console.log("Creating superadmin profile document");
            const superadminProfile: AppUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              first_name: 'Super',
              last_name: 'Admin',
              role: 'superadmin',
              company: 'mywater',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            try {
              await setDoc(doc(db, "app_users_business", firebaseUser.uid), superadminProfile);
              console.log("✅ Superadmin profile created");
              setCurrentUser(superadminProfile);
            } catch (createError) {
              console.warn("Could not create superadmin profile:", createError);
              // Continue with claims data even if profile creation fails
            }
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
          company: companyFromClaims || 'mywater',
          source: 'auth_state_change'
        });
        
        return;
      }
      
      // If no claims, try Firestore as before (fallback for existing users)
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
        
        // Check if this looks like a superadmin email
        const isSuperadmin = firebaseUser.email.includes('superadmin') || firebaseUser.email.includes('admin');
        
        const emergencyUser: AppUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          first_name: isSuperadmin ? 'Super' : (firebaseUser.displayName?.split(' ')[0] || 'User'),
          last_name: isSuperadmin ? 'Admin' : (firebaseUser.displayName?.split(' ')[1] || ''),
          role: isSuperadmin ? 'superadmin' : 'user' as UserRole,
          company: 'mywater',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setCurrentUser(emergencyUser);
        setUserRole(isSuperadmin ? 'superadmin' : 'user');
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
