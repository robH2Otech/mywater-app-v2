
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { auth } from "@/integrations/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { BusinessLayout } from "@/components/layout/BusinessLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { validateTokenClaims, logAuditEvent } from "@/utils/auth/securityUtils";
import { verifyUserClaims, refreshUserClaims } from "@/utils/admin/adminClaimsManager";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isTempAccess, setIsTempAccess] = useState(false);
  const [hasValidRoleClaims, setHasValidRoleClaims] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const tempAccess = localStorage.getItem('tempAccess') === 'true';
    setIsTempAccess(tempAccess);

    // Use Firebase authentication directly
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthenticated(!!user);
      
      // For security, validate token claims
      if (user) {
        // Use our enhanced claims verification
        const { hasValidClaims, role } = await verifyUserClaims();
        setHasValidRoleClaims(hasValidClaims);
        
        // If no valid claims, try to refresh
        if (!hasValidClaims) {
          console.log("No valid claims detected on protected route, attempting refresh");
          await refreshUserClaims();
          
          // Check again after refresh
          const refreshResult = await verifyUserClaims();
          setHasValidRoleClaims(refreshResult.hasValidClaims);
        }
        
        // Log route access for audit trail
        logAuditEvent('route_access', {
          path: location.pathname,
          role: role,
          hasValidClaims
        });
      } else {
        setHasValidRoleClaims(false);
      }
    });

    return () => unsubscribe();
  }, [location.pathname]);

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
  
  // Additional security check - if authenticated but no valid role claims
  // Force logout and redirect to auth page
  if (isAuthenticated && hasValidRoleClaims === false) {
    // Log security issue
    logAuditEvent('security_violation', {
      type: 'missing_role_claims',
      path: location.pathname
    }, 'warning');
    
    // Force logout
    auth.signOut().then(() => {
      return <Navigate to="/auth" state={{ securityIssue: true }} />;
    });
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-red-500 rounded-full animate-spin"></div>
          <p className="text-red-400 mt-4">Security validation failed. Logging out...</p>
        </div>
      </div>
    );
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

// Role-based route guard with enhanced security
const RoleBasedRouteGuard = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { userRole, isLoading, company } = useAuth();
  
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
  
  // Enhanced restriction tables for different roles
  const restrictedRoutes = {
    user: ['/users', '/maintenance', '/admin'],
    technician: ['/admin'],
    admin: [], // Admins can access everything except superadmin routes
    superadmin: [] // Superadmins can access everything
  };
  
  // Get restricted routes for current user role
  const currentRoleRestrictions = userRole ? restrictedRoutes[userRole] || [] : [];
  
  // Check if current path is restricted for user role
  const isRestrictedRoute = currentRoleRestrictions.some(route => 
    location.pathname.startsWith(route)
  );
  
  // Redirect if user is trying to access a restricted route
  if (isRestrictedRoute) {
    // Log security violation attempt
    logAuditEvent('security_violation', {
      type: 'unauthorized_route_access',
      path: location.pathname,
      role: userRole,
      company
    }, 'warning');
    
    return <Navigate to="/dashboard" />;
  }
  
  // Special handling for 2FA-required routes (superadmin operations)
  const twoFactorRequiredRoutes = ['/users/create', '/settings/advanced'];
  const needsTwoFactor = userRole === 'superadmin' && 
    twoFactorRequiredRoutes.some(route => location.pathname.startsWith(route));
  
  if (needsTwoFactor) {
    // In a real implementation, check if 2FA is verified for this session
    // For now, just log the event
    logAuditEvent('2fa_required', {
      path: location.pathname,
      role: userRole
    });
    
    // In a real implementation, redirect to 2FA verification
    // return <Navigate to="/verify-2fa" state={{ returnUrl: location.pathname }} />;
  }
  
  return <>{children}</>;
};

export const PrivateProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      
      // Log private route access
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
