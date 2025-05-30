
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

  const fetchUserFromFirestore = useCallback(async (firebaseUser: FirebaseUser): Promise<AppUser | null> => {
    try {
      console.log("🔍 Fetching user data from Firestore for:", firebaseUser.email);

      // Try to get user by document ID (UID)
      const userDocRef = doc(db, "app_users_business", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as AppUser;
        console.log("✅ Found user by UID:", userData);
        return {
          ...userData,
          id: userDoc.id,
        };
      }

      // Fallback: Query by email
      console.log("🔄 User not found by UID, searching by email...");
      const userQuery = query(
        collection(db, "app_users_business"),
        where("email", "==", firebaseUser.email)
      );
      
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data() as AppUser;
        console.log("✅ Found user by email:", userData);
        return {
          ...userData,
          id: userSnapshot.docs[0].id,
        };
      }

      console.log("❌ User not found in Firestore app_users_business collection");
      return null;
    } catch (error) {
      console.error("❌ Error fetching user from Firestore:", error);
      return null;
    }
  }, []);

  const refreshUserSession = useCallback(async (): Promise<boolean> => {
    try {
      if (!firebaseUser) return false;
      
      console.log("🔄 Refreshing user session...");
      
      const firestoreUser = await fetchUserFromFirestore(firebaseUser);
      
      if (firestoreUser) {
        setCurrentUser(firestoreUser);
        setUserRole(firestoreUser.role);
        setCompany(firestoreUser.company || null);
        console.log("✅ Session refreshed with Firestore data:", {
          email: firestoreUser.email,
          role: firestoreUser.role,
          company: firestoreUser.company
        });
        return true;
      } else {
        console.log("⚠️ User not found in Firestore, using Firebase auth data");
        const { firstName, lastName } = extractUserNames(firebaseUser);
        
        const fallbackUser: AppUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          first_name: firstName,
          last_name: lastName,
          role: 'user', // Default role when not found in Firestore
          status: "active",
          company: null
        };
        
        setCurrentUser(fallbackUser);
        setUserRole('user');
        setCompany(null);
        
        console.log("⚠️ Using fallback user data:", fallbackUser);
        return false;
      }
    } catch (error) {
      console.error("❌ Error refreshing user session:", error);
      return false;
    }
  }, [firebaseUser, fetchUserFromFirestore]);

  const handleAuthStateChange = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      console.log("🚪 User signed out, clearing state");
      setCurrentUser(null);
      setUserRole(null);
      setCompany(null);
      return;
    }

    try {
      console.log("🔄 Processing auth state change for:", firebaseUser.email);
      
      const firestoreUser = await fetchUserFromFirestore(firebaseUser);
      
      if (firestoreUser) {
        setCurrentUser(firestoreUser);
        setUserRole(firestoreUser.role);
        setCompany(firestoreUser.company || null);
        
        console.log("✅ User authenticated with Firestore data:", {
          id: firestoreUser.id,
          email: firestoreUser.email,
          name: `${firestoreUser.first_name} ${firestoreUser.last_name}`,
          role: firestoreUser.role,
          company: firestoreUser.company
        });
      } else {
        console.log("⚠️ User authenticated but not found in Firestore");
        const { firstName, lastName } = extractUserNames(firebaseUser);
        
        const fallbackUser: AppUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          first_name: firstName,
          last_name: lastName,
          role: 'user',
          status: "active",
          company: null
        };
        
        setCurrentUser(fallbackUser);
        setUserRole('user');
        setCompany(null);
        
        console.log("⚠️ Using fallback authentication data for:", firebaseUser.email);
      }
    } catch (error) {
      console.error("❌ Error in auth state change handler:", error);
      
      // Fallback to basic Firebase user data
      const { firstName, lastName } = extractUserNames(firebaseUser);
      const fallbackUser: AppUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        first_name: firstName,
        last_name: lastName,
        role: 'user',
        status: "active",
        company: null
      };
      
      setCurrentUser(fallbackUser);
      setUserRole('user');
      setCompany(null);
      
      console.log("🚨 Error fallback - using basic Firebase data");
    }
  }, [fetchUserFromFirestore]);

  return {
    currentUser,
    userRole,
    company,
    refreshUserSession,
    handleAuthStateChange
  };
}
