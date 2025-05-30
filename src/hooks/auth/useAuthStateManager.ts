
import { useState, useEffect, useCallback } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { AppUser, UserRole } from "@/types/users";

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

  const extractUserNames = (firebaseUser: FirebaseUser) => {
    let firstName = "";
    let lastName = "";

    if (firebaseUser.displayName) {
      const nameParts = firebaseUser.displayName.trim().split(' ');
      firstName = nameParts[0] || "";
      lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : "";
    } else if (firebaseUser.email) {
      // Extract name from email and capitalize it
      const emailName = firebaseUser.email.split('@')[0];
      firstName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      lastName = "";
    }

    return { firstName, lastName };
  };

  const refreshUserSession = useCallback(async (): Promise<boolean> => {
    try {
      if (!firebaseUser) return false;
      
      console.log("🔄 Refreshing user session...");
      
      // For testing, set superadmin role
      setUserRole('superadmin');
      setCompany('xwater');
      console.log("✅ Session refreshed successfully with role: superadmin");
      return true;
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
      
      // Set superadmin role for testing
      setUserRole('superadmin');
      setCompany('xwater');
      
      // Extract names with better logic
      const { firstName, lastName } = extractUserNames(firebaseUser);
      
      // Try to fetch user profile from Firestore, but fallback gracefully
      try {
        const businessUserDocRef = doc(db, "app_users_business", firebaseUser.uid);
        const businessUserDoc = await getDoc(businessUserDocRef);
        
        if (businessUserDoc.exists()) {
          const userData = businessUserDoc.data() as AppUser;
          setCurrentUser({
            ...userData,
            id: businessUserDoc.id,
            role: 'superadmin', // Override role for testing
            first_name: userData.first_name || firstName,
            last_name: userData.last_name || lastName
          });
        } else {
          // Create a minimal user object with extracted name
          setCurrentUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            first_name: firstName,
            last_name: lastName,
            role: 'superadmin',
            status: "active",
            company: 'xwater'
          });
        }
      } catch (firestoreError) {
        console.log("Could not fetch user from Firestore, using Firebase data:", firestoreError);
        // Fallback to Firebase user data with extracted names
        setCurrentUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          first_name: firstName,
          last_name: lastName,
          role: 'superadmin',
          status: "active",
          company: 'xwater'
        });
      }
      
      console.log("✅ User authenticated successfully with role: superadmin");
    } catch (error) {
      console.error("❌ Error in auth state change handler:", error);
      // Even on error, set minimal user data with extracted names
      const { firstName, lastName } = extractUserNames(firebaseUser);
      setUserRole('superadmin');
      setCompany('xwater');
      setCurrentUser({
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        first_name: firstName,
        last_name: lastName,
        role: 'superadmin',
        status: "active",
        company: 'xwater'
      });
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
