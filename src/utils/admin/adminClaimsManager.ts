
import { auth } from "@/integrations/firebase/client";
import { refreshUserToken, getCurrentUserClaims, initializeUserClaims } from "./claimsService";
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
      
      // Log this event for security audit
      logAuditEvent('claims_refresh', {
        action: 'manual_token_refresh',
        timestamp: new Date().toISOString()
      });
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
    
    console.log("Current user claims verification:", {
      uid: user.uid,
      email: user.email,
      role,
      company,
      hasValidClaims: !!role
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
  const { hasValidClaims, role, company } = await verifyUserClaims();
  
  if (!hasValidClaims) {
    console.log("Missing or invalid claims detected, attempting refresh...");
    
    // First try to refresh token
    const refreshed = await refreshUserClaims();
    
    if (refreshed) {
      // Verify again after refresh
      const refreshResult = await verifyUserClaims();
      
      if (!refreshResult.hasValidClaims) {
        console.log("Still no valid claims after refresh, attempting initialization...");
        await initializeUserClaims();
        
        // Final verification
        return await verifyUserClaims();
      }
      
      return refreshResult;
    }
  }
  
  return { hasValidClaims, role, company };
};

/**
 * Complete user setup with proper claims
 * This function should be called when a user needs to be fully initialized
 */
export const completeUserSetup = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("No authenticated user for setup");
      return false;
    }
    
    console.log("Starting complete user setup for:", user.email);
    
    // Step 1: Verify current claims
    const { hasValidClaims } = await verifyUserClaims();
    
    if (hasValidClaims) {
      console.log("User already has valid claims");
      return true;
    }
    
    // Step 2: Initialize claims if missing
    const initialized = await initializeUserClaims();
    
    if (initialized) {
      console.log("User claims initialized successfully");
      return true;
    }
    
    console.log("Failed to initialize user claims");
    return false;
    
  } catch (error) {
    console.error("Error in complete user setup:", error);
    return false;
  }
};
