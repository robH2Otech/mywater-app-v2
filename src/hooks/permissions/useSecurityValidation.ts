
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { verifyUserClaims, refreshUserClaims } from "@/utils/admin/adminClaimsManager";
import { logAuditEvent } from "@/utils/auth/securityUtils";
import { useRolePermissions } from "./useRolePermissions";

export function useSecurityValidation() {
  const { userRole, refreshUserSession } = useAuth();
  const { userRole: roleFromHook } = useRolePermissions();
  const [secureRoleVerified, setSecureRoleVerified] = useState(false);
  
  // Verify token claims on mount for enhanced security
  useEffect(() => {
    const verifySecureClaims = async () => {
      if (userRole) {
        const { hasValidClaims, role } = await verifyUserClaims();
        setSecureRoleVerified(hasValidClaims && role === userRole);
        
        if (!hasValidClaims && userRole) {
          logAuditEvent('security_warning', {
            type: 'role_mismatch',
            clientRole: userRole,
            tokenRole: role
          }, 'warning');
          
          console.log("Attempting to refresh token due to claims mismatch");
          await refreshUserSession();
        } else if (role !== userRole) {
          logAuditEvent('security_warning', {
            type: 'role_discrepancy',
            clientRole: userRole,
            tokenRole: role
          }, 'warning');
          
          console.log("Attempting to refresh session due to role discrepancy");
          await refreshUserSession();
        }
      } else {
        setSecureRoleVerified(false);
        
        if (!userRole && !secureRoleVerified) {
          console.log("No role found but user appears logged in, attempting refresh");
          await refreshUserSession();
        }
      }
    };
    
    verifySecureClaims();
  }, [userRole, refreshUserSession, secureRoleVerified]);

  return {
    secureRoleVerified
  };
}
