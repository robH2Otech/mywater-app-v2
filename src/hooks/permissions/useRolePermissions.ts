
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/users";

export function useRolePermissions() {
  const { userRole: authUserRole } = useAuth();
  
  // Explicitly ensure userRole includes all UserRole values including superadmin
  const userRole: UserRole | null = authUserRole;

  // Check if user has a specific role
  const hasRole = (role: UserRole | UserRole[]): boolean => {
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

  // Check if user is technician (limited access, no settings)
  const isTechnician = (): boolean => {
    return userRole === "technician";
  };

  // Check if user is admin (company-level admin)
  const isAdmin = (): boolean => {
    return userRole === "admin";
  };

  return {
    userRole, // Now properly typed to include superadmin
    hasRole,
    isSuperAdmin,
    isCompanyUser,
    isTechnician,
    isAdmin
  };
}
