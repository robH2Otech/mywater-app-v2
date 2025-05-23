
import { auth } from "@/integrations/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { User } from "@/types/users";

// Check if token has required custom claims
export const validateTokenClaims = async (): Promise<{
  hasValidClaims: boolean;
  role: string | null;
  company: string | null;
}> => {
  try {
    // Get current user
    const user = auth.currentUser;
    
    if (!user) {
      return { hasValidClaims: false, role: null, company: null };
    }

    // Force token refresh to get latest claims
    await user.getIdToken(true);
    
    // Get the ID token result which contains custom claims
    const idTokenResult = await user.getIdTokenResult();
    
    // Check for required custom claims
    const role = idTokenResult.claims.role as string || null;
    const company = idTokenResult.claims.company as string || null;
    
    // For debugging
    console.log("Token claims:", {
      role,
      company,
      allClaims: idTokenResult.claims
    });
    
    return { 
      hasValidClaims: Boolean(role), 
      role, 
      company 
    };
  } catch (error) {
    console.error("Error validating token claims:", error);
    return { hasValidClaims: false, role: null, company: null };
  }
};

// Security state monitor
export const useSecurityMonitor = () => {
  // Token expiry time in milliseconds (default to 1 hour)
  const TOKEN_EXPIRY_WARNING = 5 * 60 * 1000; // 5 minutes before expiry
  
  // Start monitoring token expiry
  const startTokenExpiryMonitor = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const tokenResult = await user.getIdTokenResult();
      const expiryTime = new Date(tokenResult.expirationTime).getTime();
      const currentTime = Date.now();
      
      // Calculate time until expiry
      const timeUntilExpiry = expiryTime - currentTime;
      
      // If token is close to expiry, refresh it
      if (timeUntilExpiry < TOKEN_EXPIRY_WARNING) {
        console.log("Token close to expiry, refreshing...");
        await user.getIdToken(true);
      }
      
      // Schedule next check (every minute)
      setTimeout(startTokenExpiryMonitor, 60 * 1000);
    } catch (error) {
      console.error("Error monitoring token expiry:", error);
    }
  };
  
  // Monitor for session inactivity
  let inactivityTimer: ReturnType<typeof setTimeout>;
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  
  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(async () => {
      console.log("Inactivity timeout reached, logging out");
      try {
        await auth.signOut();
        window.location.href = "/auth"; // Redirect to login page
      } catch (error) {
        console.error("Error during automatic logout:", error);
      }
    }, INACTIVITY_TIMEOUT);
  };
  
  // Add event listeners for user activity
  const setupActivityMonitoring = () => {
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, resetInactivityTimer);
    });
    
    // Initial setup
    resetInactivityTimer();
  };
  
  // Cleanup activity monitoring
  const cleanupActivityMonitoring = () => {
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
      document.removeEventListener(eventType, resetInactivityTimer);
    });
    clearTimeout(inactivityTimer);
  };
  
  return {
    startTokenExpiryMonitor,
    setupActivityMonitoring,
    cleanupActivityMonitoring
  };
};

// Audit logging utility
export const logAuditEvent = async (
  action: string,
  details: Record<string, any>,
  severity: 'info' | 'warning' | 'critical' = 'info'
) => {
  try {
    const user = auth.currentUser;
    if (!user) return;
    
    // Get user role and company from token claims
    const tokenResult = await user.getIdTokenResult();
    const role = tokenResult.claims.role as string || 'unknown';
    const company = tokenResult.claims.company as string || 'unknown';
    
    const auditLog = {
      user_id: user.uid,
      user_email: user.email,
      role,
      company,
      action,
      details,
      severity,
      timestamp: new Date(),
      ip_address: 'client-side' // Note: actual IP should be captured server-side
    };
    
    // In a real implementation, this would send the log to a secure server endpoint
    // For now, just log to console
    console.log("AUDIT LOG:", auditLog);
    
    // In production, would send to Firestore secure collection:
    // await addDoc(collection(db, "audit_logs"), auditLog);
  } catch (error) {
    console.error("Error logging audit event:", error);
  }
};
