
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

interface UserDetailsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserRole?: UserRole;
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

export function UserDetailsDialog({ user, open, onOpenChange, currentUserRole = "user" }: UserDetailsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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

  const isEditable = currentUserRole === "superadmin";

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    if (!isEditable) return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!user?.id) {
        throw new Error("User ID is required");
      }
      
      if (!isEditable) {
        throw new Error("Only Super Admins can edit user details");
      }

      const userDocRef = doc(db, "app_users", user.id);
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
        subject = `Message from MYWATER Technologies`;
        body = `Hello ${fullName},\n\n`;
        break;
      case 'report':
        subject = `Your Latest Report from MYWATER Technologies`;
        body = `Hello ${fullName},\n\nPlease find attached your latest report from MYWATER Technologies.\n\nBest regards,\nMYWATER Technologies Team`;
        break;
      case 'reminder':
        subject = `Reminder from MYWATER Technologies`;
        body = `Hello ${fullName},\n\nThis is a friendly reminder about your upcoming service appointment.\n\nBest regards,\nMYWATER Technologies Team`;
        break;
      case 'invoice':
        subject = `Invoice from MYWATER Technologies`;
        body = `Hello ${fullName},\n\nPlease find attached your latest invoice from MYWATER Technologies.\n\nBest regards,\nMYWATER Technologies Team`;
        break;
    }

    // Open default email client with pre-filled details
    window.location.href = `mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    toast({
      title: "Email client opened",
      description: `Preparing to send ${action} to ${user.email}`,
    });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-spotify-darker border-spotify-accent overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            User Details
          </DialogTitle>
        </DialogHeader>

        <ScrollableDialogContent maxHeight="65vh">
          <UserDetailsForm 
            formData={formData}
            handleInputChange={handleInputChange}
            isEditable={isEditable}
          />
        </ScrollableDialogContent>

        <div className="flex justify-between mt-6">
          <UserActionButtons onAction={handleAction} />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-spotify-accent hover:bg-spotify-accent-hover"
            >
              Cancel
            </Button>
            {isEditable && (
              <Button
                onClick={handleSubmit}
                className="bg-spotify-green hover:bg-spotify-green/90"
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
