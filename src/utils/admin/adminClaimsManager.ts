
import { auth } from "@/integrations/firebase/client";
import { refreshUserToken, getCurrentUserClaims } from "./claimsService";
import { logAuditEvent } from "@/utils/auth/securityUtils";

/**
 * Force refresh the current user's token to ensure latest claims are available
 * This is crucial after claims have been updated on the server
 */
export const refreshUserClaims = async (): Promise<boolean> => {
  try {
    const refreshed = await refreshUserToken();
    if (refreshed) {
      console.log("User claims refreshed successfully");
    }
    return refreshed;
  } catch (error) {
    console.error("Error refreshing user claims:", error);
    return false;
  }
};

/**
 * Verify that a user has the expected claims and roles
 * This should be called after login and token refresh
 */
export const verifyUserClaims = async (): Promise<{
  hasValidClaims: boolean;
  role: string | null;
  company: string | null;
}> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { hasValidClaims: false, role: null, company: null };
    }
    
    // Get the latest claims
    const { role, company } = await getCurrentUserClaims();
    
    console.log("Current user claims:", {
      uid: user.uid,
      email: user.email,
      role,
      company
    });
    
    return {
      hasValidClaims: !!role, // Must have at least a role to be valid
      role,
      company
    };
  } catch (error) {
    console.error("Error verifying user claims:", error);
    return { hasValidClaims: false, role: null, company: null };
  }
};

/**
 * Check if token refresh is needed and then refresh
 * Called when authentication state seems incomplete
 */
export const checkAndRefreshUserClaims = async () => {
  const { hasValidClaims } = await verifyUserClaims();
  
  if (!hasValidClaims) {
    console.log("Missing or invalid claims detected, refreshing token...");
    await refreshUserClaims();
    // Verify again after refresh
    return await verifyUserClaims();
  }
  
  return { hasValidClaims, role: null, company: null };
};
