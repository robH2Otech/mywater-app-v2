
import { useAuth } from "@/contexts/AuthContext";
import { PermissionLevel } from "@/contexts/AuthContext";
import { validateTokenClaims, logAuditEvent } from "@/utils/auth/securityUtils";
import { useEffect, useState } from "react";

export function usePermissions() {
  const { 
    userRole, 
    company, 
    hasPermission, 
    canAccessAllCompanies, 
    canAccessCompany,
    canEdit,
    canDelete,
    canManageUsers,
    canComment
  } = useAuth();

  const [secureRoleVerified, setSecureRoleVerified] = useState(false);
  
  // Verify token claims on mount for enhanced security
  useEffect(() => {
    const verifySecureClaims = async () => {
      const { hasValidClaims, role } = await validateTokenClaims();
      setSecureRoleVerified(hasValidClaims);
      
      // Log potential security issues
      if (!hasValidClaims && userRole) {
        logAuditEvent('security_warning', {
          type: 'role_mismatch',
          clientRole: userRole,
          tokenRole: role
        }, 'warning');
      }
    };
    
    verifySecureClaims();
  }, [userRole]);

  // Check if user has a specific role
  const hasRole = (role: string | string[]): boolean => {
    if (!userRole || !secureRoleVerified) return false;
    
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    
    return userRole === role;
  };

  // Check if current user is a superadmin
  const isSuperAdmin = (): boolean => {
    return userRole === "superadmin" && secureRoleVerified;
  };

  // Check if user is a regular company-level user with read-only access
  const isCompanyUser = (): boolean => {
    return userRole === "user";
  };

  // Enhanced data view permission that logs access attempts
  const canViewData = (dataCompany: string | null, dataType: string): boolean => {
    const hasAccess = determineAccess(dataCompany);
    
    // Log access attempts for sensitive data
    if (dataType === 'sensitive' || dataType === 'financial') {
      logAuditEvent('data_access_check', {
        dataType,
        dataCompany,
        userCompany: company,
        userRole,
        accessGranted: hasAccess
      });
    }
    
    return hasAccess;
  };
  
  // Helper function to determine access
  const determineAccess = (dataCompany: string | null): boolean => {
    if (!dataCompany) return true;
    if (canAccessAllCompanies()) return true;
    return company === dataCompany;
  };

  // Check if user can submit client requests (all roles can)
  const canSubmitRequests = (): boolean => {
    return true; // All authenticated users can submit requests
  };
  
  // Check if user can export data (admin and above)
  const canExportData = (): boolean => {
    return hasRole(['admin', 'superadmin']);
  };
  
  // Check if user can access API services
  const canAccessAPI = (serviceName: string): boolean => {
    // Define access rules for different API services
    const apiAccessRules: Record<string, string[]> = {
      'ai_analysis': ['technician', 'admin', 'superadmin'],
      'export_api': ['admin', 'superadmin'],
      'monitoring_api': ['technician', 'admin', 'superadmin'],
      'user_management_api': ['admin', 'superadmin']
    };
    
    const allowedRoles = apiAccessRules[serviceName] || ['superadmin'];
    const hasAccess = userRole ? allowedRoles.includes(userRole) : false;
    
    // Log API access attempts
    logAuditEvent('api_access_attempt', {
      serviceName,
      userRole,
      granted: hasAccess
    });
    
    return hasAccess;
  };

  return {
    userRole,
    company,
    hasPermission,
    hasRole,
    isSuperAdmin,
    isCompanyUser,
    canAccessAllCompanies,
    canAccessCompany,
    canViewData,
    canEdit,
    canDelete,
    canManageUsers,
    canComment,
    canSubmitRequests,
    canExportData,
    canAccessAPI,
    secureRoleVerified
  };
}
