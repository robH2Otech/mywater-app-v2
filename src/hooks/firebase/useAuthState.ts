
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

/**
 * Hook to track Firebase authentication state
 */
export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [userType, setUserType] = useState<"business" | "private" | null>(null);

  // Check if user is already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Check if user exists in business collection
          const businessUsersRef = collection(db, "app_users_business");
          const businessQuery = query(businessUsersRef, where("email", "==", currentUser.email));
          const businessSnapshot = await getDocs(businessQuery);
          
          if (!businessSnapshot.empty) {
            setUserType("business");
          } else {
            // Check if user exists in private collection
            const privateUsersRef = collection(db, "app_users_privat");
            const privateQuery = query(privateUsersRef, where("uid", "==", currentUser.uid));
            const privateSnapshot = await getDocs(privateQuery);
            
            if (!privateSnapshot.empty) {
              setUserType("private");
            }
          }
        } catch (err) {
          console.error("Error determining user type:", err);
        }
      }
      
      setAuthChecked(true);
    });
    
    return () => unsubscribe();
  }, []);

  return {
    user,
    authChecked,
    isAuthenticated: !!user,
    userType
  };
}
