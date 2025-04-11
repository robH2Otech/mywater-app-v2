
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "@/integrations/firebase/client";

export const PrivateProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await new Promise((resolve) => {
          const unsubscribe = auth.onAuthStateChanged((user) => {
            resolve(user);
            unsubscribe();
          });
        });
        
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error("Error checking auth state:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/private-auth" />;
  }

  return <>{children}</>;
};
