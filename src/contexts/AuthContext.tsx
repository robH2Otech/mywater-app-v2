
import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";
import { AppUser, UserRole } from "@/types/users";
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

// Known superadmin emails for simplified authentication
const KNOWN_SUPERADMIN_EMAILS = [
  'rob.istria@gmail.com',
  'robert.slavec@gmail.com',
  'aljaz.slavec@gmail.com'
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [company, setCompany] = useState<string | null>(null);
  
  const permissions = usePermissionsManager(userRole, company);

  // Simplified check for superadmin
  const isKnownSuperadmin = (email: string | null): boolean => {
    return email ? KNOWN_SUPERADMIN_EMAILS.includes(email.toLowerCase()) : false;
  };

  // Simplified user data fetching
  const fetchUserData = async (uid: string, email: string): Promise<{ role: UserRole | null; company: string | null; userData: AppUser | null }> => {
    try {
      console.log("🔍 AuthContext: Fetching user data for:", email);
      
      // Check if superadmin first
      if (isKnownSuperadmin(email)) {
        console.log("✅ AuthContext: Recognized superadmin email");
        return {
          role: 'superadmin',
          company: 'X-WATER',
          userData: {
            id: uid,
            email: email,
            first_name: email.split('@')[0],
            last_name: '',
            role: 'superadmin',
            company: 'X-WATER',
            status: 'active'
          }
        };
      }
      
      // Try to fetch from business users
      const userDoc = await getDoc(doc(db, 'app_users_business', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as AppUser;
        console.log("✅ AuthContext: Found business user data");
        return {
          role: userData.role || 'technician',
          company: userData.company || 'X-WATER',
          userData
        };
      }
      
      // Fallback to private users
      const privateUserDoc = await getDoc(doc(db, 'app_users_privat', uid));
      if (privateUserDoc.exists()) {
        const userData = privateUserDoc.data() as AppUser;
        console.log("✅ AuthContext: Found private user data");
        return {
          role: 'user' as UserRole,
          company: 'private',
          userData: {
            ...userData,
            role: 'user' as UserRole
          }
        };
      }
      
      // Default fallback for authenticated users
      console.log("⚠️ AuthContext: No user data found, using defaults");
      return {
        role: 'technician',
        company: 'X-WATER',
        userData: {
          id: uid,
          email: email,
          first_name: email.split('@')[0],
          last_name: '',
          role: 'technician',
          company: 'X-WATER',
          status: 'active'
        }
      };
    } catch (error) {
      console.error('❌ AuthContext: Error fetching user data:', error);
      return { role: null, company: null, userData: null };
    }
  };

  const refreshUserSession = async (): Promise<boolean> => {
    try {
      console.log('🔄 AuthContext: Refreshing user session...');
      
      if (firebaseUser) {
        const { role, company, userData } = await fetchUserData(firebaseUser.uid, firebaseUser.email || '');
        
        if (userData) {
          setUserRole(role);
          setCompany(company);
          setCurrentUser(userData);
          setAuthError(null);
          
          console.log('✅ AuthContext: User session refreshed successfully');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ AuthContext: Error refreshing user session:', error);
      return false;
    }
  };

  useEffect(() => {
    console.log("🔄 AuthContext: Setting up Firebase auth state listener");
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🔥 AuthContext: Firebase auth state changed:", firebaseUser?.email || "no user");
      
      try {
        setFirebaseUser(firebaseUser);
        setAuthError(null);
        
        if (firebaseUser && firebaseUser.email) {
          console.log("🎫 AuthContext: Processing user authentication...");
          
          const { role, company, userData } = await fetchUserData(firebaseUser.uid, firebaseUser.email);
          
          if (userData) {
            console.log("✅ AuthContext: User authenticated:", { role, company, email: userData.email });
            setCurrentUser(userData);
            setUserRole(role);
            setCompany(company);
          } else {
            console.error("❌ AuthContext: Failed to create user data");
            setAuthError("Failed to load user data");
          }
          
          setDebugInfo({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role,
            company,
            timestamp: new Date().toISOString()
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
    
    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
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
