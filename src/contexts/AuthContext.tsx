
import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";
import { AppUser, UserRole } from "@/types/users";
import { validateTokenClaims, logAuditEvent } from "@/utils/auth/securityUtils";
import { refreshUserClaims, verifyUserClaims } from "@/utils/admin/adminClaimsManager";
import { useSecurityMonitor } from "@/hooks/security/useSecurityMonitor";
import { validateInput, emailSchema } from "@/utils/security/inputValidation";

// Define permission levels for different roles
export type PermissionLevel = "none" | "read" | "write" | "admin" | "full";

interface AuthContextType {
  currentUser: AppUser | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  userRole: UserRole | null;
  company: string | null;
  hasPermission: (requiredLevel: PermissionLevel) => boolean;
  canAccessAllCompanies: () => boolean;
  canAccessCompany: (companyName: string) => boolean;
  canEdit: () => boolean;
  canDelete: () => boolean;
  canManageUsers: () => boolean;
  canComment: () => boolean;
  canViewNavItem: (navItem: string) => boolean;
  refreshUserSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  firebaseUser: null,
  isLoading: true,
  userRole: null,
  company: null,
  hasPermission: () => false,
  canAccessAllCompanies: () => false,
  canAccessCompany: () => false,
  canEdit: () => false,
  canDelete: () => false,
  canManageUsers: () => false,
  canComment: () => false,
  canViewNavItem: () => false,
  refreshUserSession: async () => false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [company, setCompany] = useState<string | null>(null);
  
  // Initialize security monitoring
  const { reportSecurityIncident, forceLogout } = useSecurityMonitor({
    maxInactivityTime: 30 * 60 * 1000, // 30 minutes
    maxSessionTime: 8 * 60 * 60 * 1000, // 8 hours
    detectAnomalies: true
  });

  // Enhanced session validation
  const validateSecureSession = async (): Promise<boolean> => {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      // Validate token claims
      const { hasValidClaims, role, company: claimedCompany } = await verifyUserClaims();
      
      if (!hasValidClaims) {
        await reportSecurityIncident({
          type: 'invalid_token_claims',
          details: { user_id: user.uid },
          severity: 'warning'
        });
        return false;
      }

      // Check for role escalation attempts
      if (userRole && role !== userRole) {
        await reportSecurityIncident({
          type: 'role_escalation_attempt',
          details: { 
            user_id: user.uid, 
            current_role: userRole, 
            claimed_role: role 
          },
          severity: 'critical'
        });
        await forceLogout('Role escalation detected');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  };

  // Enhanced refresh user session with security checks
  const refreshUserSession = async (): Promise<boolean> => {
    try {
      if (!auth.currentUser) return false;
      
      // Validate current session first
      const isSessionValid = await validateSecureSession();
      if (!isSessionValid) {
        return false;
      }
      
      // Force token refresh
      const refreshed = await refreshUserClaims();
      
      if (refreshed) {
        // Get the updated claims
        const { hasValidClaims, role, company: updatedCompany } = await verifyUserClaims();
        
        if (hasValidClaims && role) {
          setUserRole(role as UserRole);
          setCompany(updatedCompany);
          
          // Log the successful refresh
          logAuditEvent('authentication', {
            action: 'session_refreshed',
            role,
            company: updatedCompany,
            security_validated: true
          });
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error refreshing user session:", error);
      await reportSecurityIncident({
        type: 'session_refresh_failed',
        details: { error: (error as Error).message },
        severity: 'warning'
      });
      return false;
    }
  };

  // Fetch user details with enhanced security validation - FIXED: Use UID-based lookup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Enhanced security validation
          const securityCheck = await validateSecureSession();
          if (!securityCheck) {
            setCurrentUser(null);
            setUserRole(null);
            setCompany(null);
            setIsLoading(false);
            return;
          }

          // Validate email format for security
          try {
            validateInput(emailSchema, firebaseUser.email);
          } catch (error) {
            await reportSecurityIncident({
              type: 'invalid_email_format',
              details: { user_id: firebaseUser.uid, email: firebaseUser.email },
              severity: 'warning'
            });
            await forceLogout('Invalid email format detected');
            return;
          }

          // First validate token claims (secure server-verified roles)
          const { hasValidClaims, role, company: claimedCompany } = await verifyUserClaims();
          
          // If valid claims exist, use them directly (secure)
          if (hasValidClaims && role) {
            console.log("Valid claims found:", { role, company: claimedCompany });
            
            // FIXED: Use UID-based document lookup instead of email query
            const userDocRef = doc(db, "app_users_business", firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data() as AppUser;
              const userWithId = { id: userDoc.id, ...userData };
              
              // Security check: ensure Firestore role matches token role
              if (userData.role !== role) {
                await reportSecurityIncident({
                  type: 'role_mismatch_firestore_token',
                  details: {
                    user_id: firebaseUser.uid,
                    firestore_role: userData.role,
                    token_role: role
                  },
                  severity: 'critical'
                });
                await forceLogout('Security violation: Role mismatch detected');
                return;
              }
              
              setCurrentUser(userWithId);
              // Use secure role from token claims, not from Firestore
              setUserRole(role as UserRole);
              setCompany(claimedCompany);
              
              // Log successful authentication with security validation
              logAuditEvent('user_authenticated', {
                user_id: firebaseUser.uid,
                email: firebaseUser.email,
                role,
                company: claimedCompany,
                security_validated: true
              });
            } else {
              console.error("User document not found for UID:", firebaseUser.uid);
              await reportSecurityIncident({
                type: 'user_document_not_found',
                details: { user_id: firebaseUser.uid, email: firebaseUser.email },
                severity: 'warning'
              });
              setCurrentUser(null);
              setUserRole(null);
              setCompany(null);
            }
          } else {
            // No valid claims - try to refresh the token once
            console.log("No valid claims found, attempting token refresh...");
            
            await refreshUserClaims();
            
            // Check claims again after refresh
            const refreshResult = await verifyUserClaims();
            
            if (refreshResult.hasValidClaims && refreshResult.role) {
              console.log("Claims obtained after refresh:", refreshResult);
              
              // Try to fetch Firestore data again using UID
              const userDocRef = doc(db, "app_users_business", firebaseUser.uid);
              const userDoc = await getDoc(userDocRef);
              
              if (userDoc.exists()) {
                const userData = userDoc.data() as AppUser;
                const userWithId = { id: userDoc.id, ...userData };
                
                setCurrentUser(userWithId);
                setUserRole(refreshResult.role as UserRole);
                setCompany(refreshResult.company);
              } else {
                console.error("User document not found even after token refresh");
                setCurrentUser(null);
                setUserRole(null);
                setCompany(null);
              }
            } else {
              // Still no valid claims after refresh
              console.error("User has no valid role claims in their token even after refresh");
              await reportSecurityIncident({
                type: 'no_valid_claims_after_refresh',
                details: { user_id: firebaseUser.uid },
                severity: 'critical'
              });
              setCurrentUser(null);
              setUserRole(null);
              setCompany(null);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          await reportSecurityIncident({
            type: 'user_data_fetch_error',
            details: { error: (error as Error).message },
            severity: 'warning'
          });
          setCurrentUser(null);
          setUserRole(null);
          setCompany(null);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setCompany(null);
      }
      
      setIsLoading(false);
    });
    
    return () => {
      unsubscribe();
    }
  }, [reportSecurityIncident, forceLogout]);

  // Define permission hierarchy - updated to include user role at the lowest level
  const permissionHierarchy: Record<UserRole, PermissionLevel> = {
    superadmin: "full",
    admin: "admin",
    technician: "write",
    user: "read"
  };

  // Compare permission levels
  const comparePermissions = (userPermission: PermissionLevel, requiredPermission: PermissionLevel): boolean => {
    const permissionOrder: PermissionLevel[] = ["none", "read", "write", "admin", "full"];
    const userLevel = permissionOrder.indexOf(userPermission);
    const requiredLevel = permissionOrder.indexOf(requiredPermission);
    
    return userLevel >= requiredLevel;
  };

  // Check if user has required permission based on role
  const hasPermission = (requiredLevel: PermissionLevel): boolean => {
    if (!userRole) return false;
    const userPermission = permissionHierarchy[userRole];
    return comparePermissions(userPermission, requiredLevel);
  };

  // Check if user can access all companies (superadmin or admin)
  const canAccessAllCompanies = (): boolean => {
    return userRole === "superadmin" || userRole === "admin";
  };

  // Check if user can access a specific company
  const canAccessCompany = (companyName: string): boolean => {
    if (!currentUser) return false;
    if (canAccessAllCompanies()) return true;
    return company === companyName;
  };

  // Check if user can edit data
  const canEdit = (): boolean => {
    return hasPermission("write");
  };

  // Check if user can delete data
  const canDelete = (): boolean => {
    return hasPermission("full");
  };

  // Check if user can manage users
  const canManageUsers = (): boolean => {
    return hasPermission("admin");
  };

  // Check if user can comment (technicians and above)
  const canComment = (): boolean => {
    return userRole !== "user"; // Only user role cannot comment on standard items
  };

  // Check if user can view specific navigation items
  const canViewNavItem = (navItem: string): boolean => {
    const navPermissions: Record<string, string[]> = {
      'dashboard': ['superadmin', 'admin', 'technician', 'user'],
      'units': ['superadmin', 'admin', 'technician', 'user'],
      'locations': ['superadmin', 'admin', 'technician', 'user'],
      'filters': ['superadmin', 'admin', 'technician', 'user'],
      'uvc': ['superadmin', 'admin', 'technician', 'user'],
      'alerts': ['superadmin', 'admin', 'technician', 'user'],
      'analytics': ['superadmin', 'admin', 'technician', 'user'],
      'predictive': ['superadmin', 'admin', 'technician', 'user'],
      'users': ['superadmin', 'admin'], // Only admins and superadmins can manage users
      'client-requests': ['superadmin', 'admin', 'technician', 'user'],
      'impact': ['superadmin', 'admin', 'technician', 'user'],
      'settings': ['superadmin', 'admin', 'user'] // Technicians cannot access settings
    };
    
    const allowedRoles = navPermissions[navItem] || [];
    return userRole ? allowedRoles.includes(userRole) : false;
  };

  const value = {
    currentUser,
    firebaseUser,
    isLoading,
    userRole,
    company,
    hasPermission,
    canAccessAllCompanies,
    canAccessCompany,
    canEdit,
    canDelete,
    canManageUsers,
    canComment,
    canViewNavItem,
    refreshUserSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
