
import { UserRole } from "@/types/users";
import { PermissionLevel } from "@/contexts/AuthContext";

export function usePermissionsManager(userRole: UserRole | null, company: string | null) {
  // Define permission hierarchy
  const permissionHierarchy: Record<UserRole, PermissionLevel> = {
    superadmin: "full",
    admin: "admin", 
    technician: "write",
    user: "read"
  };

  // Compare permission levels
  const comparePermissions = (userPermission: PermissionLevel, requiredPermission: PermissionLevel): boolean => {
    const permissionOrder: PermissionLevel[] = ["none", "read", "write", "admin", "full"];
    const userLevel = permissionOrder.indexOf(userPermission);
    const requiredLevel = permissionOrder.indexOf(requiredPermission);
    
    return userLevel >= requiredLevel;
  };

  // Check if user has required permission based on role
  const hasPermission = (requiredLevel: PermissionLevel): boolean => {
    if (!userRole) return false;
    const userPermission = permissionHierarchy[userRole];
    return comparePermissions(userPermission, requiredPermission);
  };

  // Check if user can access all companies (superadmin or admin)
  const canAccessAllCompanies = (): boolean => {
    return userRole === "superadmin" || userRole === "admin";
  };

  // Check if user can access a specific company
  const canAccessCompany = (companyName: string): boolean => {
    if (canAccessAllCompanies()) return true;
    return company === companyName;
  };

  // Check if user can edit data
  const canEdit = (): boolean => {
    return hasPermission("write");
  };

  // Check if user can delete data
  const canDelete = (): boolean => {
    return hasPermission("full");
  };

  // Check if user can manage users
  const canManageUsers = (): boolean => {
    return hasPermission("admin");
  };

  // Check if user can comment (technicians and above)
  const canComment = (): boolean => {
    return userRole !== "user";
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
      'users': ['superadmin', 'admin'],
      'client-requests': ['superadmin', 'admin', 'technician', 'user'],
      'impact': ['superadmin', 'admin', 'technician', 'user'],
      'settings': ['superadmin', 'admin', 'user']
    };
    
    const allowedRoles = navPermissions[navItem] || [];
    return userRole ? allowedRoles.includes(userRole) : false;
  };

  return {
    hasPermission,
    canAccessAllCompanies,
    canAccessCompany,
    canEdit,
    canDelete,
    canManageUsers,
    canComment,
    canViewNavItem
  };
}
