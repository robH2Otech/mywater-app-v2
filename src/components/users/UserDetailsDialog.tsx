import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { User, UserRole, UserStatus } from "@/types/users";
import { ScrollableDialogContent } from "@/components/shared/ScrollableDialogContent";
import { UserDetailsForm } from "./UserDetailsForm";
import { UserActionButtons } from "./UserActionButtons";
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
  const { hasPermission, userRole, company: currentUserCompany } = usePermissions();
  
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
    }
  };

  const handleAction = (action: 'email' | 'report' | 'reminder' | 'invoice') => {
    if (!user?.email) {
      toast({
        title: "Cannot send email",
        description: "User email is not available",
        variant: "destructive",
      });
      return;
    }

    let subject = '';
    let body = '';
    const fullName = `${user.first_name} ${user.last_name}`;

    switch (action) {
      case 'email':
        subject = `Message from MYWATER`;
        body = `Hello ${fullName},\n\n`;
        break;
      case 'report':
        subject = `Your Latest Report from MYWATER`;
        body = `Hello ${fullName},\n\nPlease find attached your latest report from MYWATER.\n\nBest regards,\nMYWATER Team`;
        break;
      case 'reminder':
        subject = `Reminder from MYWATER`;
        body = `Hello ${fullName},\n\nThis is a friendly reminder about your upcoming service appointment.\n\nBest regards,\nMYWATER Team`;
        break;
      case 'invoice':
        subject = `Invoice from MYWATER`;
        body = `Hello ${fullName},\n\nPlease find attached your latest invoice from MYWATER.\n\nBest regards,\nMYWATER Team`;
        break;
    }

    // Open default email client with pre-filled details
    window.location.href = `mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    toast({
      title: "Email client opened",
      description: `Preparing to send ${action} to ${user.email}`,
    });
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
      <DialogContent className={`${isMobile ? 'w-[95vw] max-w-[95vw]' : 'w-full max-w-[800px]'} bg-spotify-darker border-spotify-accent overflow-hidden ${isMobile ? 'p-3' : 'p-5'}`}>
        <DialogHeader className="mb-1 flex items-center">
          <div className="flex items-center gap-2">
            {getRoleIcon(user.role)}
            <DialogTitle className="text-lg font-semibold text-white">
              User Details {user.company && `(${user.company})`}
            </DialogTitle>
          </div>
        </DialogHeader>

        <ScrollableDialogContent maxHeight={isMobile ? "60vh" : "65vh"}>
          <UserDetailsForm 
            formData={formData}
            handleInputChange={handleInputChange}
            isEditable={isEditable}
            canEditField={canEditField}
          />
        </ScrollableDialogContent>

        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between items-center'} mt-4 pt-3 border-t border-gray-700`}>
          <div className={`${isMobile ? 'order-2' : ''}`}>
            {hasPermission("write") && (
              <UserActionButtons onAction={handleAction} />
            )}
          </div>
          <div className={`flex gap-2 ${isMobile ? 'order-1 justify-center' : ''}`}>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-spotify-accent hover:bg-spotify-accent-hover h-8 text-sm px-3"
            >
              Close
            </Button>
            {isEditable && (
              <Button
                onClick={handleSubmit}
                className="bg-spotify-green hover:bg-spotify-green/90 h-8 text-sm px-3"
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
