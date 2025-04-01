
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { User, UserRole, UserStatus } from "@/types/users";
import { ScrollableDialogContent } from "@/components/shared/ScrollableDialogContent";
import { UserDetailsForm } from "./UserDetailsForm";
import { UserActionButtons } from "./UserActionButtons";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Save } from "lucide-react";

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
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const initialFormData = useRef<UserFormData | null>(null);

  useEffect(() => {
    if (user) {
      const newFormData = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone || "",
        company: user.company || "",
        job_title: user.job_title || "",
        role: user.role,
        status: user.status,
        password: user.password || ""
      };
      
      setFormData(newFormData);
      initialFormData.current = { ...newFormData };
      setHasChanges(false);
    }
  }, [user]);

  const isEditable = currentUserRole === "superadmin" || currentUserRole === "admin";

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    if (!isEditable) return;
    
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };
      // Check if anything has changed from initial values
      if (initialFormData.current) {
        const hasAnyChanges = Object.keys(newFormData).some(
          key => newFormData[key as keyof UserFormData] !== initialFormData.current?.[key as keyof UserFormData]
        );
        setHasChanges(hasAnyChanges);
      }
      return newFormData;
    });
  };

  const handleCloseDialog = () => {
    if (hasChanges) {
      setShowUnsavedChangesDialog(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!user?.id) {
        throw new Error("User ID is required");
      }
      
      if (!isEditable) {
        throw new Error("Only Admins and Super Admins can edit user details");
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
      initialFormData.current = { ...formData };
      setHasChanges(false);
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

  if (!user) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[700px] bg-spotify-darker border-spotify-accent overflow-hidden">
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

          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
            <UserActionButtons onAction={handleAction} />
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                className="bg-spotify-accent hover:bg-spotify-accent-hover"
              >
                Cancel
              </Button>
              {isEditable && (
                <Button
                  onClick={handleSubmit}
                  className="bg-spotify-green hover:bg-spotify-green/90"
                  disabled={!hasChanges}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
        <AlertDialogContent className="bg-spotify-darker border-spotify-accent text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              You have unsaved changes. Are you sure you want to close without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-spotify-accent hover:bg-spotify-accent-hover text-white border-none">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-mywater-blue hover:bg-mywater-blue/90 text-white"
              onClick={() => {
                setShowUnsavedChangesDialog(false);
                onOpenChange(false);
              }}
            >
              Close Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
