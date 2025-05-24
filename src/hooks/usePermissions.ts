
import { useAuth } from "@/contexts/AuthContext";
import { PermissionLevel } from "@/contexts/AuthContext";
import { verifyUserClaims, refreshUserClaims } from "@/utils/admin/adminClaimsManager";
import { logAuditEvent } from "@/utils/auth/securityUtils";
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
    canComment,
    refreshUserSession
  } = useAuth();

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

  // Check if user is technician (limited access, no settings)
  const isTechnician = (): boolean => {
    return userRole === "technician";
  };

  // Check if user is admin (company-level admin)
  const isAdmin = (): boolean => {
    return userRole === "admin";
  };

  // Enhanced data view permission with company filtering
  const canViewData = (dataCompany: string | null, dataType: string = 'general'): boolean => {
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
  
  // Helper function to determine company-based access
  const determineAccess = (dataCompany: string | null): boolean => {
    if (!dataCompany) return true;
    if (canAccessAllCompanies()) return true;
    return company === dataCompany;
  };

  // Check if user can view specific navigation items
  const canViewNavItem = (navItem: string): boolean => {
    const navPermissions: Record<string, string[]> = {
      'dashboard': ['superadmin', 'admin', 'technician', 'user'],
      'units': ['superadmin', 'admin', 'technician', 'user'],
      'locations': ['superadmin', 'admin', 'technician', 'user'],
      'filters': ['superadmin', 'admin', 'technician', 'user'],
      'uvc': ['superadmin', 'admin', 'technician', 'user'],
      'alerts': ['superadmin', 'admin', 'technician', 'user'],
      'analytics': ['superadmin', 'admin', 'technician', 'user'],
      'predictive': ['superadmin', 'admin', 'technician', 'user'],
      'users': ['superadmin', 'admin'], // Only admins and superadmins can manage users
      'client-requests': ['superadmin', 'admin', 'technician', 'user'],
      'impact': ['superadmin', 'admin', 'technician', 'user'],
      'settings': ['superadmin', 'admin', 'user'] // Technicians cannot access settings
    };
    
    const allowedRoles = navPermissions[navItem] || [];
    return userRole ? allowedRoles.includes(userRole) : false;
  };

  // Check if user can perform CRUD operations
  const canCreate = (): boolean => {
    return hasRole(['superadmin', 'admin', 'technician']);
  };

  const canUpdate = (): boolean => {
    return hasRole(['superadmin', 'admin', 'technician']);
  };

  const canDeleteData = (): boolean => {
    return hasRole(['superadmin', 'admin']);
  };

  // Check if user can access cross-company data (superadmin only)
  const canAccessCrossCompany = (): boolean => {
    return isSuperAdmin();
  };

  // Check if user can export data
  const canExportData = (): boolean => {
    return hasRole(['admin', 'superadmin']);
  };
  
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

  // Check if user should see read-only mode
  const isReadOnlyMode = (): boolean => {
    return isCompanyUser(); // Only regular users have read-only access
  };

  // Filter data based on company access
  const filterDataByCompany = <T extends { company?: string; company_id?: string }>(data: T[]): T[] => {
    if (isSuperAdmin()) {
      return data; // Superadmins see all data
    }
    
    return data.filter(item => {
      const itemCompany = item.company || item.company_id;
      return !itemCompany || itemCompany === company;
    });
  };

  return {
    userRole,
    company,
    hasPermission,
    hasRole,
    isSuperAdmin,
    isCompanyUser,
    isTechnician,
    isAdmin,
    canAccessAllCompanies,
    canAccessCompany,
    canViewData,
    canViewNavItem,
    canEdit,
    canDelete,
    canCreate,
    canUpdate,
    canDeleteData,
    canManageUsers,
    canComment,
    canAccessCrossCompany,
    canExportData,
    canAccessAPI,
    isReadOnlyMode,
    filterDataByCompany,
    secureRoleVerified,
    refreshPermissions: refreshUserSession
  };
}
