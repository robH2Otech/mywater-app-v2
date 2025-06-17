
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { UserRole, UserStatus } from "@/types/users";
import { AddUserDialogContent } from "./AddUserDialogContent";
import { usePermissions } from "@/hooks/usePermissions";
import { inviteUser } from "@/utils/admin/userInvitationService";
import { generateSecurePassword } from "@/utils/admin/passwordUtils";

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
  const { userRole, company: currentUserCompany } = usePermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: currentUserCompany || "",
    job_title: "",
    role: "user",
    status: "active",
    password: generateSecurePassword()
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      console.log("Starting user invitation process...");

      // Simple permission check - only superadmins can create any role
      if (userRole !== "superadmin") {
        throw new Error("Only superadmins can create users");
      }
      
      // Validate required fields
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.company || !formData.password) {
        throw new Error("First name, last name, email, company, and password are required");
      }

      // Send invitation using the service with password
      const result = await inviteUser(formData, "X-WATER Admin");

      console.log("Invitation result:", result);

      if (result.success) {
        // Complete success - user created and email sent
        toast({
          title: "Success!",
          description: result.message,
        });
      } else if (result.userCreated && !result.emailSent) {
        // Partial success - user created but email failed
        toast({
          title: "User Created",
          description: result.message,
          variant: "default",
        });
      } else {
        // Complete failure - user not created
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }

      // Reset form and close dialog if user was created (regardless of email status)
      if (result.userCreated) {
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          company: currentUserCompany || "",
          job_title: "",
          role: "user",
          status: "active",
          password: generateSecurePassword()
        });
        
        if (onOpenChange) {
          onOpenChange(false);
        }

        // Refresh users list
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }

    } catch (error: any) {
      console.error("Error in user invitation process:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to create user and send invitation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] bg-spotify-darker border-spotify-accent p-0 overflow-hidden">
        <AddUserDialogContent 
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          onCancel={() => onOpenChange?.(false)}
          canCreateSuperAdmin={userRole === "superadmin"}
          canCreateAdmin={userRole === "superadmin"}
          isSubmitting={isSubmitting}
          onGeneratePassword={handleGeneratePassword}
        />
      </DialogContent>
    </Dialog>
  );
}
