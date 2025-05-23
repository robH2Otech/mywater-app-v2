
import { auth } from "@/integrations/firebase/client";
import { verifyUserClaims, refreshUserClaims } from "@/utils/admin/adminClaimsManager";
import { logAuditEvent } from "@/utils/auth/securityUtils";

/**
 * Initialize authentication and claims when the app starts
 * This should be called early in the application lifecycle
 */
export const initializeAuthState = async (): Promise<void> => {
  const user = auth.currentUser;
  
  if (!user) {
    console.log("No authenticated user found during initialization");
    return;
  }
  
  try {
    console.log("Initializing auth state for user:", user.email);
    
    // First check if user has valid claims
    const { hasValidClaims, role } = await verifyUserClaims();
    
    if (!hasValidClaims) {
      console.log("User missing proper role claims, forcing token refresh");
      await refreshUserClaims();
      
      // Log the event
      logAuditEvent('authentication', {
        action: 'force_token_refresh',
        user_email: user.email,
        reason: 'missing_claims'
      });
    } else {
      console.log("User has valid claims with role:", role);
    }
  } catch (error) {
    console.error("Error initializing auth state:", error);
  }
};

/**
 * Check for claims consistency on route change
 * This helps catch situations where claims might be stale
 */
export const validateAuthOnRouteChange = async (): Promise<boolean> => {
  const user = auth.currentUser;
  
  if (!user) return false;
  
  try {
    // Verify claims are present and valid
    const { hasValidClaims, role } = await verifyUserClaims();
    
    if (!hasValidClaims) {
      console.log("Claims validation failed on route change, forcing refresh");
      
      // Try to refresh the token
      const refreshed = await refreshUserClaims();
      
      if (!refreshed) {
        console.error("Failed to refresh user claims on route change");
        return false;
      }
      
      // Check claims again after refresh
      const refreshCheck = await verifyUserClaims();
      return refreshCheck.hasValidClaims;
    }
    
    return true;
  } catch (error) {
    console.error("Error validating auth on route change:", error);
    return false;
  }
};
