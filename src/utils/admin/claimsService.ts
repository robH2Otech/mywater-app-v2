
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
    if (!user) {
      console.log("No authenticated user to refresh token for");
      return false;
    }
    
    console.log("Refreshing token for user:", user.email);
    
    // Force token refresh to get updated custom claims
    await user.getIdToken(true);
    console.log("User token refreshed successfully");
    
    // Log the new claims for verification
    const idTokenResult = await user.getIdTokenResult();
    console.log("New token claims:", {
      role: idTokenResult.claims.role,
      company: idTokenResult.claims.company
    });
    
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

/**
 * Initialize claims for the current user if they don't exist
 */
export const initializeUserClaims = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) return false;
    
    // Check if user already has claims
    const { role } = await getCurrentUserClaims();
    if (role) {
      console.log("User already has role claims:", role);
      return true;
    }
    
    console.log("User missing role claims, attempting to initialize...");
    
    // For now, we'll just refresh the token and see if claims appear
    // In a production system, you might want to call a function to assign default claims
    await refreshUserToken();
    
    const { role: newRole } = await getCurrentUserClaims();
    return !!newRole;
  } catch (error) {
    console.error("Error initializing user claims:", error);
    return false;
  }
};
