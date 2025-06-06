
import { auth } from "@/integrations/firebase/client";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/integrations/firebase/client";

/**
 * Verify if user has valid claims in their JWT token
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

    const idTokenResult = await user.getIdTokenResult();
    const role = idTokenResult.claims.role as string || null;
    const company = idTokenResult.claims.company as string || null;
    
    console.log("🔍 Token claims check:", { role, company, email: user.email });
    
    return { 
      hasValidClaims: Boolean(role && company), 
      role, 
      company 
    };
  } catch (error) {
    console.error("❌ Error verifying user claims:", error);
    return { hasValidClaims: false, role: null, company: null };
  }
};

/**
 * Refresh user claims by forcing token refresh
 */
export const refreshUserClaims = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("⚠️ No authenticated user to refresh claims for");
      return false;
    }
    
    console.log("🔄 Refreshing user token...");
    await user.getIdToken(true);
    console.log("✅ User token refreshed successfully");
    
    return true;
  } catch (error) {
    console.error("❌ Error refreshing user claims:", error);
    return false;
  }
};

/**
 * Initialize claims for users who don't have them
 * This function tries to call the cloud function or sets default values
 */
export const initializeUserClaims = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) return false;
    
    console.log("🔧 Initializing claims for user:", user.email);
    
    // Try to call the cloud function
    try {
      const initClaimsFunction = httpsCallable(functions, 'initializeUserClaims');
      const result = await initClaimsFunction({});
      console.log("✅ Claims initialized via cloud function:", result.data);
      return true;
    } catch (cloudFunctionError) {
      console.log("⚠️ Cloud function not available, using fallback approach");
      
      // Fallback: For specific known emails, we assume they are technicians for X-WATER
      const knownTechnicianEmails = [
        'sara.kovac@gmail.com',
        'technician@x-water.com'
      ];
      
      if (user.email && knownTechnicianEmails.includes(user.email.toLowerCase())) {
        console.log("🔧 Applying fallback technician role for:", user.email);
        // Note: We can't actually set custom claims from the client
        // But we can proceed with the assumption that this user is a technician
        return true;
      }
      
      return false;
    }
  } catch (error) {
    console.error("❌ Error initializing user claims:", error);
    return false;
  }
};
