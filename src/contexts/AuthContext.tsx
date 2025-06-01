
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
          
          // Get current token claims with retry logic
          let idTokenResult;
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            try {
              idTokenResult = await firebaseUser.getIdTokenResult(retryCount > 0);
              break;
            } catch (error) {
              console.log(`AuthContext: Token retry ${retryCount + 1}/${maxRetries}:`, error);
              retryCount++;
              if (retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
              }
            }
          }
          
          if (!idTokenResult) {
            throw new Error("Failed to get ID token after retries");
          }
          
          const roleFromClaims = idTokenResult.claims.role as UserRole;
          const companyFromClaims = idTokenResult.claims.company as string;
          
          console.log("AuthContext: Claims from token:", { role: roleFromClaims, company: companyFromClaims });
          
          if (roleFromClaims) {
            console.log("✅ AuthContext: User has valid claims:", { role: roleFromClaims, company: companyFromClaims });
            
            setDebugInfo({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              claims: { role: roleFromClaims, company: companyFromClaims },
              timestamp: new Date().toISOString()
            });
            
            await handleAuthStateChange(firebaseUser);
          } else {
            console.log("⚠️ AuthContext: No role in claims, checking AuthService...");
            
            // For superadmin accounts, try to initialize claims if missing
            if (firebaseUser.email && (firebaseUser.email.includes('superadmin') || firebaseUser.email.includes('admin'))) {
              console.log("🔧 AuthContext: Detected potential superadmin, trying to initialize claims");
              
              try {
                const initialized = await AuthService.initializeUserClaims();
                if (initialized) {
                  console.log("✅ AuthContext: Claims initialized successfully for admin");
                  // Force token refresh and retry
                  await firebaseUser.getIdToken(true);
                  const retryResult = await AuthService.verifyAndFixClaims();
                  if (retryResult.success) {
                    await handleAuthStateChange(firebaseUser);
                  } else {
                    console.log("🔧 AuthContext: Allowing admin access with fallback");
                    await handleAuthStateChange(firebaseUser);
                  }
                } else {
                  console.log("🔧 AuthContext: Allowing admin access with fallback after failed init");
                  await handleAuthStateChange(firebaseUser);
                }
              } catch (initError) {
                console.log("AuthContext: Claims init failed, but allowing admin access:", initError);
                await handleAuthStateChange(firebaseUser);
              }
            } else {
              // For non-admin users, use standard AuthService flow
              const authResult = await AuthService.verifyAndFixClaims();
              
              if (authResult.success) {
                console.log("✅ AuthContext: AuthService successful:", authResult.claims);
                await handleAuthStateChange(firebaseUser);
              } else {
                setAuthError("Account permissions not properly configured. Please contact administrator.");
              }
            }
            
            setDebugInfo({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              timestamp: new Date().toISOString()
            });
          }
        } else {
          setDebugInfo(null);
        }
      } catch (error) {
        console.error("❌ AuthContext: Error processing auth state change:", error);
        
        // For admin users, allow access even if there are auth issues
        if (firebaseUser?.email && (firebaseUser.email.includes('superadmin') || firebaseUser.email.includes('admin'))) {
          console.log("🔧 AuthContext: Allowing admin access despite auth error");
          try {
            await handleAuthStateChange(firebaseUser);
          } catch (handleError) {
            console.error("AuthContext: Even fallback handling failed:", handleError);
            setAuthError(`Auth processing error: ${error}`);
          }
        } else {
          setAuthError(`Auth processing error: ${error}`);
        }
      } finally {
        setIsLoading(false);
      }
    });
    
    return () => {
      console.log("🧹 AuthContext: Cleaning up auth state listener");
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
