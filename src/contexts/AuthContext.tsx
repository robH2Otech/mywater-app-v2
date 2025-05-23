
import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";
import { User, UserRole } from "@/types/users";
import { validateTokenClaims, useSecurityMonitor, logAuditEvent } from "@/utils/auth/securityUtils";

// Define permission levels for different roles
export type PermissionLevel = "none" | "read" | "write" | "admin" | "full";

interface AuthContextType {
  currentUser: User | null;
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
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
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
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [company, setCompany] = useState<string | null>(null);
  const { startTokenExpiryMonitor, setupActivityMonitoring, cleanupActivityMonitoring } = useSecurityMonitor();

  // Fetch user details from Firestore when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // First validate token claims (secure server-verified roles)
          const { hasValidClaims, role, company: claimedCompany } = await validateTokenClaims();
          
          // If valid claims exist, use them directly (secure)
          if (hasValidClaims && role) {
            // Query Firestore only for additional user details, not for role/permissions
            const usersRef = collection(db, "app_users_business");
            const q = query(usersRef, where("email", "==", firebaseUser.email));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const userData = querySnapshot.docs[0].data() as User;
              const userWithId = { id: querySnapshot.docs[0].id, ...userData };
              
              setCurrentUser(userWithId);
              // Use secure role from token claims, not from Firestore
              setUserRole(role as UserRole);
              setCompany(claimedCompany);
              
              // Log successful authentication
              logAuditEvent('user_authenticated', {
                user_id: firebaseUser.uid,
                email: firebaseUser.email,
                role,
                company: claimedCompany
              });
              
              // Start security monitoring
              startTokenExpiryMonitor();
              setupActivityMonitoring();
            } else {
              console.error("User exists in Firebase Auth but not in Firestore");
              setCurrentUser(null);
              setUserRole(null);
              setCompany(null);
            }
          } else {
            // No valid claims - the user needs to be properly set up by an admin
            console.error("User has no valid role claims in their token");
            setCurrentUser(null);
            setUserRole(null);
            setCompany(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentUser(null);
          setUserRole(null);
          setCompany(null);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setCompany(null);
        cleanupActivityMonitoring();
      }
      
      setIsLoading(false);
    });
    
    return () => {
      unsubscribe();
      cleanupActivityMonitoring();
    }
  }, []);

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

  const value = {
    currentUser,
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
