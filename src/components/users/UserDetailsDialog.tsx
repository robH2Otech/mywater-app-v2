
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
    if (!user?.email) return;

    let subject = '';
    let body = '';

    switch (action) {
      case 'report':
        subject = 'Your Latest Report';
        body = 'Please find attached your latest report.';
        break;
      case 'reminder':
        subject = 'Reminder';
        body = 'This is a reminder for your upcoming tasks.';
        break;
      case 'invoice':
        subject = 'Invoice';
        body = 'Please find attached your latest invoice.';
        break;
      default:
        subject = '';
        body = '';
    }

    window.location.href = `mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
