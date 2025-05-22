
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { auth } from "@/integrations/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { BusinessLayout } from "@/components/layout/BusinessLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isTempAccess, setIsTempAccess] = useState(false);

  useEffect(() => {
    const tempAccess = localStorage.getItem('tempAccess') === 'true';
    setIsTempAccess(tempAccess);

    // Use Firebase authentication directly
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null && !isTempAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-blue-200 mt-4">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isTempAccess) {
    return <Navigate to="/auth" />;
  }

  // Wrap the children with AuthProvider and BusinessLayout
  return (
    <AuthProvider>
      <RoleBasedRouteGuard>
        <BusinessLayout>{children}</BusinessLayout>
      </RoleBasedRouteGuard>
    </AuthProvider>
  );
};

// New component to handle role-based route access
const RoleBasedRouteGuard = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { userRole, isLoading } = useAuth();
  
  // Still loading auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-blue-200 mt-4">Loading permissions...</p>
        </div>
      </div>
    );
  }
  
  // Restricted routes for "user" role
  const restrictedForUserRoutes = [
    '/users', 
    '/maintenance', 
    '/admin'
  ];
  
  // Check if current path is restricted for user role
  const isRestrictedRoute = restrictedForUserRoutes.some(route => 
    location.pathname.startsWith(route)
  );
  
  // Redirect if user is trying to access a restricted route
  if (userRole === 'user' && isRestrictedRoute) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

export const PrivateProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    
    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-blue-200 mt-4">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/private-auth" />;
  }

  return <AuthProvider>{children}</AuthProvider>;
};
