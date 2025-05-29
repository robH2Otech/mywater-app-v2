
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
  debugInfo: null
});

export const useAuth = () => useContext(AuthContext);

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

  useEffect(() => {
    console.log("🔄 Setting up enhanced Firebase auth state listener");
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🔥 Firebase auth state changed:", {
        user: firebaseUser ? firebaseUser.email : "no user",
        uid: firebaseUser?.uid,
        emailVerified: firebaseUser?.emailVerified
      });
      
      setFirebaseUser(firebaseUser);
      setAuthError(null);
      
      if (firebaseUser) {
        try {
          console.log("🎫 Processing user authentication...");
          
          // Use AuthService for enhanced claims handling
          const authResult = await AuthService.verifyAndFixClaims();
          
          if (authResult.success) {
            console.log("✅ User authenticated with claims:", authResult.claims);
            
            setDebugInfo({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              claims: authResult.claims,
              timestamp: new Date().toISOString()
            });
            
            await handleAuthStateChange(firebaseUser);
          } else {
            console.log("⚠️ User authenticated but claims verification failed");
            setAuthError("Account permissions not properly configured. Please contact administrator.");
            
            setDebugInfo({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              error: "Claims verification failed",
              needsInitialization: authResult.needsClaimsInitialization
            });
          }
        } catch (error) {
          console.error("❌ Error processing enhanced auth state change:", error);
          setAuthError(`Auth processing error: ${error}`);
        }
      } else {
        setDebugInfo(null);
      }
      
      setIsLoading(false);
    });
    
    return () => {
      console.log("🧹 Cleaning up enhanced auth state listener");
      unsubscribe();
    };
  }, [handleAuthStateChange]);

  const value = {
    currentUser,
    firebaseUser,
    isLoading,
    userRole,
    company,
    refreshUserSession,
    authError,
    debugInfo,
    ...permissions
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
