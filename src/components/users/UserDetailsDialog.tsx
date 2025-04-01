
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
import { Save, X } from "lucide-react";

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
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSubmit = async () => {
    try {
      if (!user?.id) {
        throw new Error("User ID is required");
      }
      
      if (!isEditable) {
        throw new Error("You don't have permission to edit user details");
      }

      setIsSaving(true);
      
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
      setHasChanges(false);
      setIsSaving(false);
      onOpenChange(false);
    } catch (error: any) {
      setIsSaving(false);
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

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen && hasChanges) {
        // Confirm before closing with unsaved changes
        if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
          onOpenChange(false);
        }
      } else {
        onOpenChange(newOpen);
      }
    }}>
      <DialogContent className="sm:max-w-[650px] bg-spotify-darker border-spotify-accent overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            User Details
            {hasChanges && (
              <span className="text-sm text-yellow-400 font-normal ml-2">
                (Unsaved changes)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollableDialogContent maxHeight="65vh">
          <UserDetailsForm 
            formData={formData}
            handleInputChange={handleInputChange}
            isEditable={isEditable}
          />
        </ScrollableDialogContent>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-6">
          <UserActionButtons onAction={handleAction} />
          
          <div className="flex gap-2 self-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-spotify-accent hover:bg-spotify-accent-hover"
            >
              <X size={16} className="mr-1" />
              Cancel
            </Button>
            
            {isEditable && (
              <Button
                onClick={handleSubmit}
                className={`bg-spotify-green hover:bg-spotify-green/90 ${!hasChanges ? 'opacity-70' : ''}`}
                disabled={!hasChanges || isSaving}
              >
                <Save size={16} className="mr-1" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
