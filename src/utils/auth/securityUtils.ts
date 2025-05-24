
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
