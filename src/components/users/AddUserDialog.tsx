
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { UserRole, UserStatus } from "@/types/users";
import { AddUserDialogContent } from "./AddUserDialogContent";
import { usePermissions } from "@/hooks/usePermissions";
import { createBusinessUser } from "@/utils/admin/businessUserService";
import { useAuth } from "@/contexts/AuthContext";

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  role: UserRole;
  status: UserStatus;
  password: string;
}

interface AddUserDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission, userRole, company: currentUserCompany } = usePermissions();
  const { refreshUserSession } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: currentUserCompany || "",
    job_title: "",
    role: "user", // Default role for new users
    status: "active",
    password: ""
  });

  // Check if user can create users with specific role
  const canCreateWithRole = (role: UserRole): boolean => {
    // Superadmin can create any role
    if (userRole === "superadmin") return true;
    // Admin can create technician and user roles
    if (userRole === "admin" && ["technician", "user"].includes(role)) return true;
    return false;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === "role" && !canCreateWithRole(value as UserRole)) {
      toast({
        title: "Permission denied",
        description: `You don't have permission to create ${value} users`,
        variant: "destructive",
      });
      return;
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      console.log("Starting user creation process...");
      console.log("Current user role:", userRole);
      console.log("Form data:", { ...formData, password: "[HIDDEN]" });

      // Superadmin has unrestricted access to create any user
      if (userRole !== "superadmin") {
        // Only admins and above can create users (non-superadmin restrictions)
        if (!hasPermission("admin")) {
          throw new Error("You don't have permission to create users");
        }

        // Validate role permissions for non-superadmins
        if (!canCreateWithRole(formData.role)) {
          throw new Error(`You don't have permission to create ${formData.role} users`);
        }
      }
      
      // Validate required fields
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.company) {
        throw new Error("First name, last name, email, password and company are required");
      }

      console.log("Creating new business user:", formData.email);

      // Use the direct creation service with secondary auth
      const result = await createBusinessUser({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        job_title: formData.job_title,
        role: formData.role,
        status: formData.status,
        password: formData.password
      });

      console.log("Business user created successfully:", result);

      // Refresh the user session to ensure admin stays authenticated
      const sessionRefreshed = await refreshUserSession();
      if (!sessionRefreshed) {
        console.warn("Session refresh failed, but user was created successfully");
      }

      toast({
        title: "Success",
        description: "User has been created successfully. You remain signed in.",
      });

      // Reset form and close dialog
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        company: currentUserCompany || "",
        job_title: "",
        role: "user",
        status: "active",
        password: ""
      });
      
      if (onOpenChange) {
        onOpenChange(false);
      }

      // Refresh users list
      queryClient.invalidateQueries({ queryKey: ["users"] });

    } catch (error: any) {
      console.error("Error creating user:", error);
      
      // Attempt to refresh session if there was an auth-related error
      if (error.message.includes('auth') || error.message.includes('permission')) {
        await refreshUserSession();
      }
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-spotify-darker border-spotify-accent overflow-hidden">
        <AddUserDialogContent 
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          onCancel={() => onOpenChange?.(false)}
          canCreateSuperAdmin={userRole === "superadmin"}
          canCreateAdmin={userRole === "superadmin"}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
