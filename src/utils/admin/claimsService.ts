
import { auth } from "@/integrations/firebase/client";

/**
 * Known superadmin emails that should get automatic superadmin status
 */
const SUPERADMIN_EMAILS = [
  'rob.istria@gmail.com',
  'robert.slavec@gmail.com',
  'aljaz.slavec@gmail.com'
];

/**
 * Check if email is a known superadmin
 */
export const isSuperadminEmail = (email: string): boolean => {
  return SUPERADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Simple user claims without Firebase Functions - NO LONGER USING FUNCTIONS
 */
export const getCurrentUserClaims = async (): Promise<{
  role: string | null;
  company: string | null;
}> => {
  try {
    const user = auth.currentUser;
    if (!user) return { role: null, company: null };
    
    // Simple email-based role detection
    const role = isSuperadminEmail(user.email || '') ? 'superadmin' : 'user';
    const company = role === 'superadmin' ? 'X-WATER' : null;
    
    console.log("Simple user claims:", { role, company, email: user.email });
    return { role, company };
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
    if (!user) return false;
    
    console.log("Forcing token refresh for user:", user.email);
    await user.getIdToken(true); // Force refresh
    return true;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return false;
  }
};

/**
 * DISABLED - Initialize user claims via Firebase Function
 * This function is disabled because we're not using Firebase Functions
 */
export const initializeUserClaims = async (): Promise<boolean> => {
  console.log("initializeUserClaims: DISABLED - Using simple email-based detection instead");
  return true;
};

/**
 * DISABLED - Set custom claims for a specific user
 * This function is disabled because we're not using Firebase Functions
 */
export const setUserClaims = async (params: {
  userId: string;
  role: string;
  company: string;
}): Promise<boolean> => {
  console.log("setUserClaims: DISABLED - Using simple email-based detection instead");
  return true;
};

/**
 * DISABLED - Migrate all users to have proper claims
 * This function is disabled because we're not using Firebase Functions
 */
export const migrateAllUserClaims = async (): Promise<{
  migrated: number;
  skipped: number;
  errors: number;
}> => {
  console.log("migrateAllUserClaims: DISABLED - Using simple email-based detection instead");
  return { migrated: 0, skipped: 0, errors: 0 };
};

/**
 * DISABLED - Set custom claims for superadmin users
 * This function is disabled because we're not using Firebase Functions
 */
export const setSuperadminClaims = async (): Promise<boolean> => {
  console.log("setSuperadminClaims: DISABLED - Using simple email-based detection instead");
  return true;
};
