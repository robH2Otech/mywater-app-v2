
import { useAuth } from "@/contexts/AuthContext";
import { PermissionLevel } from "@/contexts/AuthContext";

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

  // Check if user has a specific role
  const hasRole = (role: string | string[]): boolean => {
    if (!userRole) return false;
    
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    
    return userRole === role;
  };

  // Check if current user is a superadmin
  const isSuperAdmin = (): boolean => {
    return userRole === "superadmin";
  };

  // Check if user is a regular company-level user with read-only access
  const isCompanyUser = (): boolean => {
    return userRole === "user";
  };

  // Check if user can view specific data based on company
  const canViewData = (dataCompany: string | null): boolean => {
    if (!dataCompany) return true;
    if (canAccessAllCompanies()) return true;
    return company === dataCompany;
  };

  // Check if user can submit client requests (all roles can)
  const canSubmitRequests = (): boolean => {
    return true; // All authenticated users can submit requests
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
    canSubmitRequests
  };
}
