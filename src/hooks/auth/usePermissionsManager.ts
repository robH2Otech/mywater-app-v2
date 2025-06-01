
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
    
    // Superadmin always has full access
    if (userRole === "superadmin") return true;
    
    const userPermission = permissionHierarchy[userRole];
    return comparePermissions(userPermission, requiredLevel);
  };

  // Check if user can access all companies (superadmin or admin)
  const canAccessAllCompanies = (): boolean => {
    return userRole === "superadmin" || userRole === "admin";
  };

  // Check if user can access a specific company
  const canAccessCompany = (companyName: string): boolean => {
    if (userRole === "superadmin") return true; // Superadmin can access any company
    if (userRole === "admin") return true; // Admin can access any company
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
    if (!userRole) return false;
    return userRole !== "user";
  };

  // Check if user can view specific navigation items
  const canViewNavItem = (navItem: string): boolean => {
    if (!userRole) return false;
    
    // Superadmin can view everything
    if (userRole === "superadmin") return true;
    
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
    return allowedRoles.includes(userRole);
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
