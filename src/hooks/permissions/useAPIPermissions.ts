
import { logAuditEvent } from "@/utils/auth/securityUtils";
import { useRolePermissions } from "./useRolePermissions";

export function useAPIPermissions() {
  const { userRole } = useRolePermissions();

  // Check if user can access API services
  const canAccessAPI = (serviceName: string): boolean => {
    const apiAccessRules: Record<string, string[]> = {
      'ai_analysis': ['technician', 'admin', 'superadmin'],
      'export_api': ['admin', 'superadmin'],
      'monitoring_api': ['technician', 'admin', 'superadmin'],
      'user_management_api': ['admin', 'superadmin']
    };
    
    const allowedRoles = apiAccessRules[serviceName] || ['superadmin'];
    const hasAccess = userRole ? allowedRoles.includes(userRole) : false;
    
    logAuditEvent('api_access_attempt', {
      serviceName,
      userRole,
      granted: hasAccess
    });
    
    return hasAccess;
  };

  return {
    canAccessAPI
  };
}
