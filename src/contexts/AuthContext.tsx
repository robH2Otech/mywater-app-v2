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
    console.log("🔄 AuthContext: Setting up Firebase auth state listener");
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🔥 AuthContext: Firebase auth state changed:", {
        user: firebaseUser ? firebaseUser.email : "no user",
        uid: firebaseUser?.uid,
        emailVerified: firebaseUser?.emailVerified
      });
      
      try {
        setFirebaseUser(firebaseUser);
        setAuthError(null);
        
        if (firebaseUser) {
          console.log("🎫 AuthContext: Processing user authentication...");
          
          // Always try to handle auth state change, even without perfect claims
          await handleAuthStateChange(firebaseUser);
          
          // Get current token claims
          try {
            const idTokenResult = await firebaseUser.getIdTokenResult();
            const roleFromClaims = idTokenResult.claims.role as UserRole;
            const companyFromClaims = idTokenResult.claims.company as string;
            
            console.log("AuthContext: Claims from token:", { role: roleFromClaims, company: companyFromClaims });
            
            setDebugInfo({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              claims: { role: roleFromClaims, company: companyFromClaims },
              timestamp: new Date().toISOString()
            });
            
            // If no claims, that's okay - we'll provide fallback access
            if (!roleFromClaims) {
              console.log("⚠️ AuthContext: No role claims found, providing fallback access");
            }
          } catch (tokenError) {
            console.log("AuthContext: Token error, but continuing with basic auth:", tokenError);
            setDebugInfo({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              error: "Token retrieval failed",
              timestamp: new Date().toISOString()
            });
          }
        } else {
          setDebugInfo(null);
        }
      } catch (error) {
        console.error("❌ AuthContext: Error processing auth state change:", error);
        
        // Don't block authentication for claim errors
        if (firebaseUser) {
          console.log("🔧 AuthContext: Allowing access despite auth processing error");
          try {
            await handleAuthStateChange(firebaseUser);
          } catch (handleError) {
            console.error("AuthContext: Fallback handling also failed:", handleError);
          }
        }
        
        setAuthError(`Auth processing error: ${error}`);
      } finally {
        setIsLoading(false);
      }
    });
    
    return () => {
      console.log("🧹 AuthContext: Cleaning up auth state listener");
      unsubscribe();
    };
  }, [handleAuthStateChange]);

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    isLoading,
    userRole: userRole as UserRole | null,
    company,
    refreshUserSession,
    authError,
    debugInfo,
    ...permissions
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
