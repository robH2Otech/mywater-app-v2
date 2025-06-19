
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { User, UserRole, UserStatus } from "@/types/users";
import { UserDetailsForm } from "./UserDetailsForm";
import { UserActionButtons } from "./UserActionButtons";
import { FormSlider } from "@/components/shared/FormSlider";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";
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
  const { currentUser } = useAuth();
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

  // Improved permission logic - more permissive and clearer
  const canEditUser = (): boolean => {
    if (!user || !userRole) {
      console.log("UserDetailsDialog - No user or userRole available");
      return false;
    }
    
    console.log("UserDetailsDialog - Permission check:", {
      currentUserRole: userRole,
      targetUserRole: user.role,
      currentUserId: currentUser?.id,
      targetUserId: user.id,
      isSameUser: currentUser?.id === user.id
    });
    
    // Superadmins can edit ANYONE - this should ALWAYS return true
    if (userRole === "superadmin") {
      console.log("UserDetailsDialog - Superadmin can edit anyone - GRANTED");
      return true;
    }
    
    // Users can edit their own profile (basic fields only)
    if (currentUser?.id === user.id) {
      console.log("UserDetailsDialog - User can edit their own profile - GRANTED");
      return true;
    }
    
    // Admins can edit technicians and regular users, but not other admins or superadmins
    if (userRole === "admin") {
      const canEditRole = ["technician", "user"].includes(user.role);
      console.log("UserDetailsDialog - Admin edit check:", { canEditRole, targetRole: user.role });
      return canEditRole;
    }
    
    console.log("UserDetailsDialog - No edit permission granted");
    return false;
  };
  
  // Check if current user can edit specific fields
  const canEditField = (field: keyof UserFormData): boolean => {
    if (!canEditUser()) return false;
    
    // If user is editing their own profile, restrict some fields
    if (currentUser?.id === user?.id && userRole !== "superadmin") {
      // Regular users can't change their own role or status
      if (field === "role" || field === "status") {
        return false;
      }
    }
    
    // Only superadmins can change roles to admin or superadmin
    if (field === "role" && userRole !== "superadmin" && ["superadmin", "admin"].includes(formData.role)) {
      return false;
    }
    
    return true;
  };

  const isEditable = canEditUser();
  
  // For superadmins, ALWAYS show the save button
  const shouldShowSaveButton = isEditable || userRole === "superadmin";

  // Show permission debug info
  console.log("UserDetailsDialog - Render state:", {
    isEditable,
    shouldShowSaveButton,
    userRole,
    currentUserCompany,
    hasWritePermission: hasPermission("write"),
    user: user ? { id: user.id, role: user.role, email: user.email } : null
  });

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    if (!canEditField(field)) {
      console.log(`UserDetailsDialog - Field ${field} not editable`);
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!user?.id) {
        throw new Error("User ID is required");
      }
      
      if (!shouldShowSaveButton) {
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
      console.error("UserDetailsDialog - Submit error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
      <DialogContent className="sm:max-w-[600px] h-[90vh] bg-spotify-darker border-spotify-accent p-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[90vh]">
          <DialogHeader className="px-6 py-4 border-b border-spotify-accent shrink-0">
            <div className="flex items-center gap-2">
              {getRoleIcon(user.role)}
              <DialogTitle className="text-xl font-semibold text-white">
                User Details {user.company && `(${user.company})`}
              </DialogTitle>
            </div>
            {!isEditable && userRole !== "superadmin" && (
              <p className="text-sm text-gray-400 mt-1">
                {currentUser?.id === user.id ? "Editing your own profile (limited fields)" : "Read-only view"}
              </p>
            )}
            {userRole === "superadmin" && (
              <p className="text-sm text-green-400 mt-1">
                Superadmin - Full edit access
              </p>
            )}
          </DialogHeader>

          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-6 py-4 min-h-0"
          >
            <UserDetailsForm 
              formData={formData}
              handleInputChange={handleInputChange}
              isEditable={true} // Always show form, but individual fields will be disabled based on canEditField
              canEditField={canEditField}
            />
          </div>

          <div className="px-6">
            <FormSlider containerRef={scrollContainerRef} />
          </div>

          <div className="shrink-0 border-t border-spotify-accent bg-spotify-darker">
            <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between items-center'} px-6 py-4`}>
              <div className={`${isMobile ? 'order-2' : ''}`}>
                {hasPermission("write") && (
                  <UserActionButtons onAction={handleAction} />
                )}
              </div>
              <div className={`flex gap-2 ${isMobile ? 'order-1 justify-center' : ''}`}>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="bg-spotify-accent hover:bg-spotify-accent-hover text-white border-none"
                  disabled={isSubmitting}
                >
                  Close
                </Button>
                {shouldShowSaveButton && (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-mywater-blue hover:bg-mywater-blue/90"
                  >
                    {isSubmitting ? "Updating..." : "Update User"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
