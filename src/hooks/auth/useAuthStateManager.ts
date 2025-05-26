
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
      
      // Step 1: Try to get user document by UID first (business users)
      const userDocRef = doc(db, "app_users_business", firebaseUser.uid);
      let userDoc = await getDoc(userDocRef);
      let userData: AppUser | null = null;
      
      if (userDoc.exists()) {
        userData = userDoc.data() as AppUser;
        console.log("✅ Business user document found:", userData);
      } else {
        // Step 2: Try private users collection
        const privateUserDocRef = doc(db, "app_users_privat", firebaseUser.uid);
        const privateUserDoc = await getDoc(privateUserDocRef);
        
        if (privateUserDoc.exists()) {
          userData = privateUserDoc.data() as AppUser;
          console.log("✅ Private user document found:", userData);
        } else {
          // Step 3: Search by email in business collection (for migration)
          console.log("🔍 Searching for user by email...");
          const usersQuery = query(
            collection(db, "app_users_business"),
            where("email", "==", firebaseUser.email)
          );
          const querySnapshot = await getDocs(usersQuery);
          
          if (!querySnapshot.empty) {
            // Migrate existing document to correct UID
            console.log("📋 Migrating user document to correct UID...");
            const existingData = querySnapshot.docs[0].data();
            
            userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              first_name: existingData.first_name || '',
              last_name: existingData.last_name || '',
              role: existingData.role as UserRole || 'user',
              company: existingData.company || 'mywater',
              status: existingData.status || 'active',
              created_at: existingData.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            await setDoc(userDocRef, userData);
            console.log("✅ User document migrated successfully");
          } else {
            console.log("❌ No user document found anywhere");
            setCurrentUser(null);
            setUserRole(null);
            setCompany(null);
            return;
          }
        }
      }
      
      // Step 4: Set user data
      setCurrentUser({ id: firebaseUser.uid, ...userData });
      setUserRole(userData.role as UserRole);
      setCompany(userData.company || 'mywater');
      
      // Step 5: Log successful authentication
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
