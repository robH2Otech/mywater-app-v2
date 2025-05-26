
import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";
import { AppUser, UserRole } from "@/types/users";
import { useAuthStateManager } from "@/hooks/auth/useAuthStateManager";
import { usePermissionsManager } from "@/hooks/auth/usePermissionsManager";

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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const {
    currentUser,
    userRole,
    company,
    refreshUserSession,
    handleAuthStateChange
  } = useAuthStateManager(firebaseUser);

  const permissions = usePermissionsManager(userRole, company);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser ? firebaseUser.email : "no user");
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        await handleAuthStateChange(firebaseUser);
      }
      
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [handleAuthStateChange]);

  const value = {
    currentUser,
    firebaseUser,
    isLoading,
    userRole,
    company,
    refreshUserSession,
    ...permissions
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
