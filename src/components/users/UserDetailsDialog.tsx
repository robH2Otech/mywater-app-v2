import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { User, UserRole, UserStatus } from "@/types/users";
import { UserDetailsForm } from "./UserDetailsForm";
import { FormSlider } from "@/components/shared/FormSlider";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePermissions } from "@/hooks/usePermissions";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

interface UserDetailsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserFormData {
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

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { userRole } = usePermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<UserFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    job_title: "",
    role: "user",
    status: "active",
    password: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone || "",
        company: user.company || "",
        job_title: user.job_title || "",
        role: user.role,
        status: user.status,
        password: user.password || ""
      });
    }
  }, [user]);

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
  const canEditField = (field: keyof UserFormData): boolean => {
    if (!canEditUser()) return false;
    
    // Only superadmins can change roles to admin or superadmin
    if (field === "role" && userRole !== "superadmin" && ["superadmin", "admin"].includes(formData.role)) {
      return false;
    }
    
    return true;
  };

  const isEditable = canEditUser();

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    if (!canEditField(field)) return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!user?.id) {
        throw new Error("User ID is required");
      }
      
      if (!isEditable) {
        throw new Error("You don't have permission to edit this user");
      }

      setIsSubmitting(true);

      const userDocRef = doc(db, "app_users_business", user.id);
      await updateDoc(userDocRef, {
        ...formData,
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "User details updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["users"] });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "superadmin":
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
      case "admin":
        return <ShieldCheck className="h-5 w-5 text-blue-400" />;
      case "technician":
        return <Shield className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] bg-spotify-darker border-spotify-accent p-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[90vh]">
          <DialogHeader className="px-6 py-4 border-b border-spotify-accent shrink-0">
            <div className="flex items-center gap-2">
              {getRoleIcon(user.role)}
              <DialogTitle className="text-xl font-semibold text-white">
                User Details {user.company && `(${user.company})`}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-6 py-4 min-h-0"
          >
            <UserDetailsForm 
              formData={formData}
              handleInputChange={handleInputChange}
              isEditable={isEditable}
              canEditField={canEditField}
            />
          </div>

          <div className="px-6">
            <FormSlider containerRef={scrollContainerRef} />
          </div>

          <div className="shrink-0 border-t border-spotify-accent bg-spotify-darker px-6 py-4">
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-spotify-accent hover:bg-spotify-accent-hover text-white border-none"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              {isEditable && (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-mywater-blue hover:bg-mywater-blue/90"
                >
                  {isSubmitting ? "Updating..." : "Save Changes"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
