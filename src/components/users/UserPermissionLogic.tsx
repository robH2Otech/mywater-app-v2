import { UserRole } from "@/types/users";
import { usePermissions } from "@/hooks/usePermissions";

interface UserPermissionLogicProps {
  user: { role: UserRole } | null;
}

export function useUserPermissionLogic({ user }: UserPermissionLogicProps) {
  const { userRole } = usePermissions();

  // Check if current user can edit this user based on roles
  const canEditUser = (): boolean => {
    if (!user || !userRole) return false;
    
    // Superadmins can edit anyone
    if (userRole === "superadmin") return true;
    
    // Admins can edit technicians and regular users, but not other admins or superadmins
    if (userRole === "admin") {
      return ["technician", "user"].includes(user.role);
    }
    
    // Other roles can't edit users
    return false;
  };
  
  // Check if current user can edit this specific field
  const canEditField = (field: string, formRole: UserRole): boolean => {
    if (!canEditUser()) return false;
    
    // Only superadmins can change roles to admin or superadmin
    if (field === "role" && userRole !== "superadmin" && ["superadmin", "admin"].includes(formRole)) {
      return false;
    }
    
    return true;
  };

  return {
    canEditUser: canEditUser(),
    canEditField
  };
}
