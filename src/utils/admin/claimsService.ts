
import { auth } from "@/integrations/firebase/client";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/integrations/firebase/client";

/**
 * Known superadmin emails that should get automatic superadmin claims
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
 * Force refresh the current user's token to get latest claims
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
 * Get current user's claims from their JWT token
 */
export const getCurrentUserClaims = async (): Promise<{
  role: string | null;
  company: string | null;
}> => {
  try {
    const user = auth.currentUser;
    if (!user) return { role: null, company: null };
    
    const idTokenResult = await user.getIdTokenResult();
    const role = idTokenResult.claims.role as string || null;
    const company = idTokenResult.claims.company as string || null;
    
    console.log("Current user claims:", { role, company, email: user.email });
    return { role, company };
  } catch (error) {
    console.error("Error getting user claims:", error);
    return { role: null, company: null };
  }
};

/**
 * Initialize user claims via Firebase Function
 */
export const initializeUserClaims = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) return false;
    
    console.log("Initializing claims for user:", user.email);
    
    const initClaimsFunction = httpsCallable(functions, 'initializeUserClaims');
    await initClaimsFunction({});
    
    // Force token refresh to get new claims
    await refreshUserToken();
    
    return true;
  } catch (error) {
    console.error("Error initializing user claims:", error);
    return false;
  }
};

/**
 * Set custom claims for superadmin users
 */
export const setSuperadminClaims = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) return false;
    
    // Only proceed if this is a known superadmin email
    if (!isSuperadminEmail(user.email)) {
      console.log("User is not a known superadmin:", user.email);
      return false;
    }
    
    console.log("Setting superadmin claims for:", user.email);
    
    // Call the Firebase function to set claims
    const setClaimsFunction = httpsCallable(functions, 'setUserClaims');
    await setClaimsFunction({
      userId: user.uid,
      role: 'superadmin',
      company: 'X-WATER' // Keep for logging/identification
    });
    
    // Force token refresh
    await refreshUserToken();
    
    return true;
  } catch (error) {
    console.error("Error setting superadmin claims:", error);
    return false;
  }
};
