
import { useRolePermissions } from "./useRolePermissions";

export function useNavigationPermissions() {
  const { userRole } = useRolePermissions();

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

  return {
    canViewNavItem
  };
}
