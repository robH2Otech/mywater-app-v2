
import { auth } from "@/integrations/firebase/client";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/integrations/firebase/client";

export interface SetClaimsRequest {
  userId: string;
  role: 'superadmin' | 'admin' | 'technician' | 'user';
  company: string;
}

/**
 * Set custom claims for a user (superadmin only)
 */
export const setUserClaims = async (request: SetClaimsRequest): Promise<boolean> => {
  try {
    const setClaimsFunction = httpsCallable(functions, 'setUserClaims');
    const result = await setClaimsFunction(request);
    
    console.log('Claims set successfully:', result.data);
    return true;
  } catch (error) {
    console.error('Error setting user claims:', error);
    throw error;
  }
};

/**
 * Migrate all existing users to have proper claims (superadmin only)
 */
export const migrateAllUserClaims = async (): Promise<{ migrated: number }> => {
  try {
    const migrateFunction = httpsCallable(functions, 'migrateUserClaims');
    const result = await migrateFunction({});
    
    console.log('Migration completed:', result.data);
    return result.data as { migrated: number };
  } catch (error) {
    console.error('Error migrating user claims:', error);
    throw error;
  }
};

/**
 * Force refresh the current user's token to get updated claims
 */
export const refreshUserToken = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) return false;
    
    // Force token refresh to get updated custom claims
    await user.getIdToken(true);
    console.log("User token refreshed successfully");
    return true;
  } catch (error) {
    console.error("Error refreshing user token:", error);
    return false;
  }
};

/**
 * Get current user's claims
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
    
    const idTokenResult = await user.getIdTokenResult();
    const role = idTokenResult.claims.role as string || null;
    const company = idTokenResult.claims.company as string || null;
    
    return { role, company };
  } catch (error) {
    console.error("Error getting user claims:", error);
    return { role: null, company: null };
  }
};
