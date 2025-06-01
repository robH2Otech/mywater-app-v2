
import { useAuth } from "@/contexts/AuthContext";
import { useRolePermissions } from "./permissions/useRolePermissions";
import { useDataPermissions } from "./permissions/useDataPermissions";
import { useNavigationPermissions } from "./permissions/useNavigationPermissions";
import { useAPIPermissions } from "./permissions/useAPIPermissions";
import { useSecurityValidation } from "./permissions/useSecurityValidation";
import { UserRole } from "@/types/users";

export function usePermissions() {
  const { 
    company, 
    hasPermission, 
    canAccessAllCompanies, 
    canAccessCompany,
    canEdit,
    canDelete,
    canManageUsers,
    canComment,
    refreshUserSession,
    userRole
  } = useAuth();

  const rolePermissions = useRolePermissions();
  const dataPermissions = useDataPermissions();
  const navigationPermissions = useNavigationPermissions();
  const apiPermissions = useAPIPermissions();
  const { secureRoleVerified } = useSecurityValidation();

  return {
    // From auth context - userRole is already properly typed from AuthContext
    company,
    userRole,
    hasPermission,
    canAccessAllCompanies,
    canAccessCompany,
    canEdit,
    canDelete,
    canManageUsers,
    canComment,
    
    // From role permissions
    ...rolePermissions,
    
    // From data permissions
    ...dataPermissions,
    
    // From navigation permissions
    ...navigationPermissions,
    
    // From API permissions
    ...apiPermissions,
    
    // From security validation
    secureRoleVerified,
    refreshPermissions: refreshUserSession
  };
}
