
import { UserRole } from "@/types/users";
import { User } from "@/types/users";

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  role: UserRole;
  status: string;
  password: string;
}

export class UserPermissionHandler {
  private userRole: UserRole | null;
  private currentUser: any;
  private targetUser: User | null;

  constructor(userRole: UserRole | null, currentUser: any, targetUser: User | null) {
    this.userRole = userRole;
    this.currentUser = currentUser;
    this.targetUser = targetUser;
  }

  canEditUser(): boolean {
    if (!this.targetUser || !this.userRole) {
      console.log("UserPermissionHandler - No user or userRole available");
      return false;
    }
    
    console.log("UserPermissionHandler - Permission check:", {
      currentUserRole: this.userRole,
      targetUserRole: this.targetUser.role,
      currentUserId: this.currentUser?.id,
      targetUserId: this.targetUser.id,
      isSameUser: this.currentUser?.id === this.targetUser.id
    });
    
    // Superadmins can edit ANYONE
    if (this.userRole === "superadmin") {
      console.log("UserPermissionHandler - Superadmin can edit anyone - GRANTED");
      return true;
    }
    
    // Users can edit their own profile (basic fields only)
    if (this.currentUser?.id === this.targetUser.id) {
      console.log("UserPermissionHandler - User can edit their own profile - GRANTED");
      return true;
    }
    
    // Admins can edit technicians and regular users, but not other admins or superadmins
    if (this.userRole === "admin") {
      const canEditRole = ["technician", "user"].includes(this.targetUser.role);
      console.log("UserPermissionHandler - Admin edit check:", { canEditRole, targetRole: this.targetUser.role });
      return canEditRole;
    }
    
    console.log("UserPermissionHandler - No edit permission granted");
    return false;
  }

  canEditField(field: keyof UserFormData): boolean {
    if (!this.canEditUser()) return false;
    
    // If user is editing their own profile, restrict some fields
    if (this.currentUser?.id === this.targetUser?.id && this.userRole !== "superadmin") {
      // Regular users can't change their own role or status
      if (field === "role" || field === "status") {
        return false;
      }
    }
    
    // Only superadmins can change roles to admin or superadmin
    if (field === "role" && this.userRole !== "superadmin") {
      const formData = { role: this.targetUser?.role } as UserFormData;
      if (["superadmin", "admin"].includes(formData.role)) {
        return false;
      }
    }
    
    return true;
  }

  shouldShowSaveButton(): boolean {
    console.log("UserPermissionHandler - shouldShowSaveButton check:", {
      userRole: this.userRole,
      canEditUser: this.canEditUser(),
      isSuperadmin: this.userRole === "superadmin"
    });
    
    // Superadmins ALWAYS see the save button
    if (this.userRole === "superadmin") {
      console.log("UserPermissionHandler - Superadmin should see save button - TRUE");
      return true;
    }
    
    // For other users, show save button if they can edit
    const canEdit = this.canEditUser();
    console.log("UserPermissionHandler - shouldShowSaveButton result:", canEdit);
    return canEdit;
  }
}
