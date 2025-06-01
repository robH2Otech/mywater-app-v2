
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
    userRole: authUserRole
  } = useAuth();

  const rolePermissions = useRolePermissions();
  const dataPermissions = useDataPermissions();
  const navigationPermissions = useNavigationPermissions();
  const apiPermissions = useAPIPermissions();
  const { secureRoleVerified } = useSecurityValidation();

  // Explicitly preserve the full UserRole type including superadmin
  const userRole: UserRole | null = authUserRole as UserRole | null;

  return {
    // From auth context - ensure userRole is properly typed
    company,
    userRole, // Use the properly typed version
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
