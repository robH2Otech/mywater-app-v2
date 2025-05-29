
import { useState, useEffect, useCallback } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { AppUser, UserRole } from "@/types/users";
import { validateTokenClaims, logAuditEvent } from "@/utils/auth/securityUtils";

interface AuthStateManagerReturn {
  currentUser: AppUser | null;
  userRole: UserRole | null;
  company: string | null;
  refreshUserSession: () => Promise<boolean>;
  handleAuthStateChange: (firebaseUser: FirebaseUser | null) => Promise<void>;
}

export function useAuthStateManager(firebaseUser: FirebaseUser | null): AuthStateManagerReturn {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [company, setCompany] = useState<string | null>(null);

  const refreshUserSession = useCallback(async (): Promise<boolean> => {
    try {
      if (!firebaseUser) return false;
      
      console.log("🔄 Refreshing user session...");
      
      // Force token refresh to get latest claims
      await firebaseUser.getIdToken(true);
      
      // Validate claims
      const { hasValidClaims, role, company: userCompany } = await validateTokenClaims();
      
      if (hasValidClaims && role) {
        setUserRole(role as UserRole);
        setCompany(userCompany);
        console.log("✅ Session refreshed successfully with role:", role);
        return true;
      }
      
      console.log("❌ Session refresh failed - no valid claims");
      return false;
    } catch (error) {
      console.error("❌ Error refreshing user session:", error);
      return false;
    }
  }, [firebaseUser]);

  const handleAuthStateChange = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      setCurrentUser(null);
      setUserRole(null);
      setCompany(null);
      return;
    }

    try {
      console.log("🔄 Processing auth state change for:", firebaseUser.email);
      
      // Get user claims first
      const { hasValidClaims, role, company: userCompany } = await validateTokenClaims();
      
      if (hasValidClaims && role) {
        setUserRole(role as UserRole);
        setCompany(userCompany);
        
        // Try to fetch user profile from Firestore
        try {
          const usersCollection = collection(db, "users");
          const userQuery = query(usersCollection, where("email", "==", firebaseUser.email));
          const userSnapshot = await getDocs(userQuery);
          
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data() as AppUser;
            setCurrentUser({
              ...userData,
              id: userSnapshot.docs[0].id,
              role: role as UserRole
            });
          } else {
            // Create a minimal user object if not found in Firestore
            setCurrentUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              first_name: firebaseUser.displayName?.split(" ")[0] || "",
              last_name: firebaseUser.displayName?.split(" ")[1] || "",
              role: role as UserRole,
              status: "active",
              company: userCompany || undefined
            });
          }
        } catch (firestoreError) {
          console.log("Could not fetch user from Firestore, using Firebase data:", firestoreError);
          // Fallback to Firebase user data
          setCurrentUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            first_name: firebaseUser.displayName?.split(" ")[0] || "",
            last_name: firebaseUser.displayName?.split(" ")[1] || "",
            role: role as UserRole,
            status: "active",
            company: userCompany || undefined
          });
        }
        
        console.log("✅ User authenticated successfully with role:", role);
      } else {
        console.log("❌ User has no valid claims");
        setUserRole(null);
        setCompany(null);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("❌ Error in auth state change handler:", error);
      setUserRole(null);
      setCompany(null);
      setCurrentUser(null);
    }
  }, []);

  return {
    currentUser,
    userRole,
    company,
    refreshUserSession,
    handleAuthStateChange
  };
}
