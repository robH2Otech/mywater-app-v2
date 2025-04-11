
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isTempAccess, setIsTempAccess] = useState(false);

  useEffect(() => {
    const tempAccess = localStorage.getItem('tempAccess') === 'true';
    setIsTempAccess(tempAccess);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null && !isTempAccess) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated && !isTempAccess) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
};
