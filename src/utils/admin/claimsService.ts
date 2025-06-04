
import { auth, db } from "@/integrations/firebase/client";
import { doc, getDoc } from "firebase/firestore";

export interface SetClaimsRequest {
  userId: string;
  role: 'superadmin' | 'admin' | 'technician' | 'user';
  company: string;
}

/**
 * Get current user's role and company from Firestore (fallback when JWT claims are missing)
 */
export const getCurrentUserClaims = async (): Promise<{
  role: string | null;
  company: string | null;
}> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { role: null, company: null };
    }
    
    // First try to get claims from JWT token
    try {
      const idTokenResult = await user.getIdTokenResult();
      const role = idTokenResult.claims.role as string || null;
      const company = idTokenResult.claims.company as string || null;
      
      if (role) {
        return { role, company };
      }
    } catch (error) {
      console.log("Could not get JWT claims, falling back to Firestore");
    }
    
    // Fallback: Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'app_users_business', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        role: userData.role || null,
        company: userData.company || null
      };
    }
    
    // Check private users collection
    const privateUserDoc = await getDoc(doc(db, 'app_users_privat', user.uid));
    if (privateUserDoc.exists()) {
      return {
        role: 'user',
        company: 'private'
      };
    }
    
    return { role: null, company: null };
  } catch (error) {
    console.error("Error getting user claims:", error);
    return { role: null, company: null };
  }
};

/**
 * Force refresh the current user's token
 */
export const refreshUserToken = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("No authenticated user to refresh token for");
      return false;
    }
    
    console.log("Refreshing token for user:", user.email);
    
    // Force token refresh
    await user.getIdToken(true);
    console.log("User token refreshed successfully");
    
    return true;
  } catch (error) {
    console.error("Error refreshing user token:", error);
    return false;
  }
};

/**
 * Initialize claims for the current user (simplified version without Cloud Functions)
 */
export const initializeUserClaims = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) return false;
    
    // Check if user has data in Firestore
    const { role } = await getCurrentUserClaims();
    
    if (role) {
      console.log("User already has role data:", role);
      return true;
    }
    
    console.log("No user data found, user may need to be created by admin");
    return false;
  } catch (error) {
    console.error("Error initializing user claims:", error);
    return false;
  }
};

/**
 * Placeholder functions for compatibility (these would normally use Cloud Functions)
 */
export const setUserClaims = async (request: SetClaimsRequest): Promise<boolean> => {
  console.log("setUserClaims: Cloud Functions not available, this would need to be implemented server-side");
  return false;
};

export const migrateAllUserClaims = async (): Promise<{ migrated: number; skipped: number; errors: number }> => {
  console.log("migrateAllUserClaims: Cloud Functions not available, this would need to be implemented server-side");
  return { migrated: 0, skipped: 0, errors: 0 };
};
