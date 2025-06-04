
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { auth } from "@/integrations/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { BusinessLayout } from "@/components/layout/BusinessLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { logAuditEvent } from "@/utils/auth/securityUtils";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthenticated(!!user);
      
      if (user) {
        logAuditEvent('route_access', {
          path: location.pathname,
          uid: user.uid,
          email: user.email
        });
      }
    });

    return () => unsubscribe();
  }, [location.pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-spotify-dark">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-blue-200 mt-4">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return (
    <AuthProvider>
      <RoleBasedRouteGuard>
        <BusinessLayout>{children}</BusinessLayout>
      </RoleBasedRouteGuard>
    </AuthProvider>
  );
};

// Simplified role-based route guard
const RoleBasedRouteGuard = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { userRole, isLoading, company, canViewNavItem, authError } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-spotify-dark">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-blue-200 mt-4">Loading permissions...</p>
        </div>
      </div>
    );
  }
  
  // If there's an auth error but the user is authenticated, show the error
  if (authError && !userRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-spotify-dark">
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="w-10 h-10 border-t-2 border-b-2 border-red-500 rounded-full animate-spin"></div>
          <p className="text-red-400 mt-4">{authError}</p>
          <p className="text-gray-400 text-sm mt-2">
            Please contact your administrator to set up your account.
          </p>
        </div>
      </div>
    );
  }
  
  // Allow superadmin to access everything
  if (userRole === 'superadmin') {
    return <>{children}</>;
  }
  
  // Enhanced route-to-permission mapping for other roles
  const routePermissions: Record<string, string> = {
    '/dashboard': 'dashboard',
    '/units': 'units',
    '/locations': 'locations',
    '/filters': 'filters',
    '/uvc': 'uvc',
    '/alerts': 'alerts',
    '/analytics': 'analytics',
    '/users': 'users',
    '/client-requests': 'client-requests',
    '/impact': 'impact',
    '/settings': 'settings'
  };
  
  // Get the base path for permission checking
  const basePath = location.pathname.split('/')[1] ? `/${location.pathname.split('/')[1]}` : location.pathname;
  const requiredPermission = routePermissions[basePath];
  
  // Check if user can view this route
  if (requiredPermission && userRole && !canViewNavItem(requiredPermission)) {
    logAuditEvent('security_violation', {
      type: 'unauthorized_route_access',
      path: location.pathname,
      role: userRole,
      company,
      requiredPermission
    }, 'warning');
    
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

export const PrivateProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      
      if (user) {
        logAuditEvent('private_route_access', {
          path: location.pathname,
          uid: user.uid
        });
      }
    });
    
    return () => unsubscribe();
  }, [location.pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-spotify-dark">
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
