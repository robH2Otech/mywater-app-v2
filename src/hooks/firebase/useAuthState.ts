
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";

/**
 * Hook to track Firebase authentication state
 */
export function useAuthState() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
      
      if (currentUser) {
        navigate("/private-dashboard");
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  return {
    user,
    authChecked,
    isAuthenticated: !!user
  };
}
