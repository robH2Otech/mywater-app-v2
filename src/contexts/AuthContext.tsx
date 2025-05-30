
import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";
import { AppUser, UserRole } from "@/types/users";
import { useAuthStateManager } from "@/hooks/auth/useAuthStateManager";
import { usePermissionsManager } from "@/hooks/auth/usePermissionsManager";
import { AuthService } from "@/services/authService";

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
  authError: string | null;
  debugInfo: any;
  // New methods for better user data access
  getUserDisplayName: () => string;
  getUserInitials: () => string;
  getUserFirstName: () => string;
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
  refreshUserSession: async () => false,
  authError: null,
  debugInfo: null,
  getUserDisplayName: () => "User",
  getUserInitials: () => "U",
  getUserFirstName: () => "User"
});

export const useAuth = (): AuthContextType => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  const {
    currentUser,
    userRole,
    company,
    refreshUserSession,
    handleAuthStateChange
  } = useAuthStateManager(firebaseUser);

  const permissions = usePermissionsManager(userRole, company);

  // Helper functions for user data access
  const getUserDisplayName = (): string => {
    if (currentUser?.first_name && currentUser?.last_name) {
      return `${currentUser.first_name} ${currentUser.last_name}`;
    }
    if (currentUser?.first_name) {
      return currentUser.first_name;
    }
    if (firebaseUser?.displayName) {
      return firebaseUser.displayName;
    }
    if (firebaseUser?.email) {
      return firebaseUser.email.split('@')[0];
    }
    return "User";
  };

  const getUserInitials = (): string => {
    if (currentUser?.first_name && currentUser?.last_name) {
      return `${currentUser.first_name.charAt(0)}${currentUser.last_name.charAt(0)}`.toUpperCase();
    }
    if (currentUser?.first_name) {
      return currentUser.first_name.charAt(0).toUpperCase();
    }
    if (firebaseUser?.displayName) {
      const nameParts = firebaseUser.displayName.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
      }
      return nameParts[0].charAt(0).toUpperCase();
    }
    if (firebaseUser?.email) {
      return firebaseUser.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserFirstName = (): string => {
    if (currentUser?.first_name) {
      return currentUser.first_name;
    }
    if (firebaseUser?.displayName) {
      return firebaseUser.displayName.split(' ')[0];
    }
    if (firebaseUser?.email) {
      return firebaseUser.email.split('@')[0];
    }
    return "User";
  };

  useEffect(() => {
    console.log("🔄 Setting up Firebase auth state listener");
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🔥 Firebase auth state changed:", {
        user: firebaseUser ? firebaseUser.email : "no user",
        uid: firebaseUser?.uid,
        emailVerified: firebaseUser?.emailVerified
      });
      
      try {
        setFirebaseUser(firebaseUser);
        setAuthError(null);
        
        if (firebaseUser) {
          console.log("🎫 Processing user authentication...");
          
          setDebugInfo({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            role: 'superadmin',
            company: 'xwater',
            timestamp: new Date().toISOString()
          });
          
          await handleAuthStateChange(firebaseUser);
        } else {
          setDebugInfo(null);
        }
      } catch (error) {
        console.error("❌ Error processing auth state change:", error);
        setAuthError(`Auth processing error: ${error}`);
      } finally {
        setIsLoading(false);
      }
    });
    
    return () => {
      console.log("🧹 Cleaning up auth state listener");
      unsubscribe();
    };
  }, [handleAuthStateChange]);

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    isLoading,
    userRole,
    company,
    refreshUserSession,
    authError,
    debugInfo,
    getUserDisplayName,
    getUserInitials,
    getUserFirstName,
    ...permissions
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
