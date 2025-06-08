
import { httpsCallable } from "firebase/functions";
import { functions, auth } from "@/integrations/firebase/client";

/**
 * Initialize Firebase custom claims for superadmin users
 * This ensures superadmin accounts have proper JWT claims for Firestore rules
 */
export const initializeSuperadminClaims = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("❌ Claims: No authenticated user");
      return false;
    }

    console.log("🔧 Claims: Initializing claims for user:", user.email);
    
    // Check if user already has claims
    const idTokenResult = await user.getIdTokenResult();
    const existingRole = idTokenResult.claims.role;
    
    if (existingRole) {
      console.log("✅ Claims: User already has role:", existingRole);
      return true;
    }
    
    // Call the Firebase function to initialize claims
    const initClaimsFunction = httpsCallable(functions, 'initializeUserClaims');
    const result = await initClaimsFunction({});
    
    console.log("✅ Claims: Initialization result:", result.data);
    
    // Force token refresh to get new claims
    await user.getIdToken(true);
    
    return true;
  } catch (error) {
    console.error("❌ Claims: Error initializing claims:", error);
    return false;
  }
};

/**
 * Check and ensure user has proper Firebase claims
 * Call this during authentication flow for known superadmin emails
 */
export const ensureUserClaims = async (email: string): Promise<void> => {
  const knownSuperadminEmails = [
    'rob.istria@gmail.com',
    'robert.slavec@gmail.com',
    'aljaz.slavec@gmail.com'
  ];
  
  if (knownSuperadminEmails.includes(email.toLowerCase())) {
    console.log("🔧 Claims: Ensuring claims for known superadmin:", email);
    await initializeSuperadminClaims();
  }
};
