
import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";
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

// Known superadmin emails - SIMPLE VERSION
const SUPERADMIN_EMAILS = [
  'rob.istria@gmail.com',
  'robert.slavec@gmail.com',
  'aljaz.slavec@gmail.com'
];

const isSuperadminEmail = (email: string): boolean => {
  return SUPERADMIN_EMAILS.includes(email.toLowerCase());
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [company, setCompany] = useState<string | null>(null);
  
  const permissions = usePermissionsManager(userRole, company);

  // Fetch user data from Firestore
  const fetchUserData = async (uid: string): Promise<{ role: UserRole | null; company: string | null; userData: AppUser | null }> => {
    try {
      console.log("🔍 Fetching user data from Firebase for UID:", uid);
      
      const userDoc = await getDoc(doc(db, 'app_users_business', uid));
      
      if (userDoc.exists()) {
        console.log("✅ User found in app_users_business collection");
        const userData = userDoc.data() as AppUser;
        return {
          role: userData.role || null,
          company: userData.company || null,
          userData
        };
      }
      
      // Check private users collection as fallback
      const privateUserDoc = await getDoc(doc(db, 'app_users_privat', uid));
      if (privateUserDoc.exists()) {
        console.log("✅ User found in app_users_privat collection");
        const userData = privateUserDoc.data() as AppUser;
        return {
          role: 'user' as UserRole,
          company: 'private',
          userData: {
            ...userData,
            role: 'user' as UserRole
          }
        };
      }
      
      console.log("⚠️ No user data found in any collection for UID:", uid);
      return { role: null, company: null, userData: null };
    } catch (error) {
      console.error('❌ Error fetching user data from Firebase:', error);
      return { role: null, company: null, userData: null };
    }
  };

  const refreshUserSession = async (): Promise<boolean> => {
    try {
      console.log('🔄 Refreshing user session...');
      
      if (firebaseUser) {
        // Force token refresh to ensure session is valid
        await firebaseUser.getIdToken(true);
        
        // Check if superadmin
        if (firebaseUser.email && isSuperadminEmail(firebaseUser.email)) {
          setUserRole('superadmin');
          setCompany(null);
          setCurrentUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            first_name: firebaseUser.email.split('@')[0],
            last_name: '',
            role: 'superadmin',
            company: 'X-WATER',
            status: 'active'
          });
          setAuthError(null);
          console.log('✅ Superadmin session refreshed successfully');
          return true;
        }
        
        // Re-fetch user data from Firestore for regular users
        const { role, company, userData } = await fetchUserData(firebaseUser.uid);
        
        if (userData) {
          setUserRole(role);
          setCompany(company);
          setCurrentUser(userData);
          setAuthError(null);
          
          console.log('✅ User session refreshed successfully:', { role, company, email: userData.email });
          return true;
        } else {
          console.warn('⚠️ No user data found during session refresh');
          setAuthError("User data not found in system");
          return false;
        }
      } else {
        console.warn('⚠️ No Firebase user available for session refresh');
        return false;
      }
    } catch (error) {
      console.error('❌ Error refreshing user session:', error);
      setAuthError(`Session refresh failed: ${error}`);
      return false;
    }
  };

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
          
          // Check if this is a known superadmin email - SIMPLE VERSION
          if (firebaseUser.email && isSuperadminEmail(firebaseUser.email)) {
            console.log("✅ AuthContext: Superadmin email detected, setting up immediately");
            
            setUserRole('superadmin');
            setCompany(null);
            setCurrentUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              first_name: firebaseUser.email.split('@')[0],
              last_name: '',
              role: 'superadmin',
              company: 'X-WATER',
              status: 'active'
            });
            
            console.log("✅ AuthContext: Superadmin setup complete");
          } else {
            // Regular user flow - fetch from Firestore
            const { role, company, userData } = await fetchUserData(firebaseUser.uid);
            
            if (role && userData) {
              console.log("✅ AuthContext: User data found:", { role, company, email: userData.email });
              setCurrentUser(userData);
              setUserRole(role);
              setCompany(company);
            } else {
              console.log("⚠️ AuthContext: No user data found in Firestore");
              setAuthError("Account not found in system. Please contact administrator.");
            }
          }
          
          setDebugInfo({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            timestamp: new Date().toISOString(),
            backend: 'Firebase'
          });
        } else {
          // Reset state when logged out
          setCurrentUser(null);
          setUserRole(null);
          setCompany(null);
          setDebugInfo(null);
        }
      } catch (error) {
        console.error("❌ AuthContext: Error processing auth state change:", error);
        setAuthError(`Auth processing error: ${error}`);
      } finally {
        setIsLoading(false);
      }
    });
    
    return () => {
      console.log("🧹 AuthContext: Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  // Memoize the context value to prevent infinite re-renders
  const value = useMemo<AuthContextType>(() => ({
    currentUser,
    firebaseUser,
    isLoading,
    userRole,
    company,
    refreshUserSession,
    authError,
    debugInfo,
    hasPermission: permissions.hasPermission,
    canAccessAllCompanies: permissions.canAccessAllCompanies,
    canAccessCompany: permissions.canAccessCompany,
    canEdit: permissions.canEdit,
    canDelete: permissions.canDelete,
    canManageUsers: permissions.canManageUsers,
    canComment: permissions.canComment,
    canViewNavItem: permissions.canViewNavItem,
  }), [
    currentUser,
    firebaseUser,
    isLoading,
    userRole,
    company,
    refreshUserSession,
    authError,
    debugInfo,
    permissions.hasPermission,
    permissions.canAccessAllCompanies,
    permissions.canAccessCompany,
    permissions.canEdit,
    permissions.canDelete,
    permissions.canManageUsers,
    permissions.canComment,
    permissions.canViewNavItem,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
