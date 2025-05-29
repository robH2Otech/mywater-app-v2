
import { auth } from "@/integrations/firebase/client";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/integrations/firebase/client";
import { logAuditEvent } from "@/utils/auth/securityUtils";

export interface AuthResult {
  success: boolean;
  user: any;
  claims: {
    role: string | null;
    company: string | null;
  };
  needsClaimsInitialization: boolean;
}

/**
 * Enhanced authentication service with automatic claims handling
 */
export class AuthService {
  /**
   * Initialize user claims if they don't exist
   */
  static async initializeUserClaims(): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      console.log("Initializing claims for user:", user.email);
      
      const initClaimsFunction = httpsCallable(functions, 'initializeUserClaims');
      const result = await initClaimsFunction({});
      
      console.log("Claims initialization result:", result.data);
      
      // Force token refresh to get new claims
      await user.getIdToken(true);
      
      return true;
    } catch (error) {
      console.error("Error initializing user claims:", error);
      return false;
    }
  }

  /**
   * Verify user has proper claims after authentication
   */
  static async verifyAndFixClaims(): Promise<AuthResult> {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        user: null,
        claims: { role: null, company: null },
        needsClaimsInitialization: false
      };
    }

    try {
      // Get current token claims
      const idTokenResult = await user.getIdTokenResult();
      const role = idTokenResult.claims.role as string || null;
      const company = idTokenResult.claims.company as string || null;

      console.log("Current user claims:", { role, company, email: user.email });

      // If no role, try to initialize claims
      if (!role) {
        console.log("No role found, attempting to initialize claims...");
        
        const initialized = await this.initializeUserClaims();
        
        if (initialized) {
          // Get updated claims
          const updatedTokenResult = await user.getIdTokenResult(true);
          const updatedRole = updatedTokenResult.claims.role as string || null;
          const updatedCompany = updatedTokenResult.claims.company as string || null;
          
          return {
            success: true,
            user,
            claims: { role: updatedRole, company: updatedCompany },
            needsClaimsInitialization: false
          };
        } else {
          return {
            success: false,
            user,
            claims: { role: null, company: null },
            needsClaimsInitialization: true
          };
        }
      }

      return {
        success: true,
        user,
        claims: { role, company },
        needsClaimsInitialization: false
      };

    } catch (error) {
      console.error("Error verifying claims:", error);
      return {
        success: false,
        user,
        claims: { role: null, company: null },
        needsClaimsInitialization: true
      };
    }
  }

  /**
   * Handle post-authentication setup
   */
  static async handlePostAuth(): Promise<AuthResult> {
    try {
      // Small delay to ensure Firebase has processed the authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await this.verifyAndFixClaims();
      
      if (result.success) {
        logAuditEvent('authentication_success', {
          email: result.user?.email,
          role: result.claims.role,
          company: result.claims.company
        });
      } else {
        logAuditEvent('authentication_claims_issue', {
          email: result.user?.email,
          needsInitialization: result.needsClaimsInitialization
        }, 'warning');
      }
      
      return result;
    } catch (error) {
      console.error("Error in post-auth handling:", error);
      throw error;
    }
  }
}
