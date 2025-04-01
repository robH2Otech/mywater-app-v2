
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { User, UserRole } from "@/types/users";
import { ScrollableDialogContent } from "@/components/shared/ScrollableDialogContent";
import { UserDetailsForm } from "./UserDetailsForm";
import { UserDialogHeader } from "./UserDialogHeader";
import { UserDialogFooter } from "./UserDialogFooter";
import { useDialogConfirmation } from "./DialogConfirmation";
import { useUserDetailsUpdate, UserFormData } from "@/hooks/users/useUserDetailsUpdate";

interface UserDetailsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserRole?: UserRole;
}

export function UserDetailsDialog({ 
  user, 
  open, 
  onOpenChange, 
  currentUserRole = "user" 
}: UserDetailsDialogProps) {
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
  const [hasChanges, setHasChanges] = useState(false);
  
  // Update form when user changes
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
      setHasChanges(false);
    }
  }, [user]);

  // Check if user has edit permission based on role
  const isEditable = currentUserRole === "superadmin" || currentUserRole === "admin";

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    if (!isEditable) return;
    
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Check if anything has changed
      const originalData = {
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        company: user?.company || "",
        job_title: user?.job_title || "",
        role: user?.role || "user",
        status: user?.status || "active",
        password: user?.password || ""
      };
      
      const hasChanged = Object.keys(newData).some(
        key => newData[key as keyof UserFormData] !== originalData[key as keyof UserFormData]
      );
      
      setHasChanges(hasChanged);
      return newData;
    });
  };

  const { handleSubmit, isSaving } = useUserDetailsUpdate(user, () => {
    setHasChanges(false);
    onOpenChange(false);
  });

  const { handleOpenChange } = useDialogConfirmation({
    hasChanges,
    onOpenChange,
    newOpen: open
  });

  const handleAction = (action: 'email' | 'report' | 'reminder' | 'invoice') => {
    if (!user?.email) {
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
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[750px] bg-spotify-darker border-spotify-accent overflow-hidden">
        <UserDialogHeader hasChanges={hasChanges} />

        <ScrollableDialogContent maxHeight="65vh">
          <UserDetailsForm 
            formData={formData}
            handleInputChange={handleInputChange}
            isEditable={isEditable}
          />
        </ScrollableDialogContent>

        <UserDialogFooter 
          onClose={() => onOpenChange(false)}
          onSave={() => handleSubmit(formData)}
          hasChanges={hasChanges}
          isSaving={isSaving}
          isEditable={isEditable}
          onAction={handleAction}
        />
      </DialogContent>
    </Dialog>
  );
}
