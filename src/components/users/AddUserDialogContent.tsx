
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserDetailsForm } from "./UserDetailsForm";
import { ScrollableDialogContent } from "@/components/shared/ScrollableDialogContent";
import { UserRole, UserStatus } from "@/types/users";

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

interface AddUserDialogContentProps {
  formData: UserFormData;
  handleInputChange: (field: keyof UserFormData, value: string) => void;
  handleSubmit: () => void;
  onCancel: () => void;
  canCreateSuperAdmin?: boolean;
  canCreateAdmin?: boolean;
}

export function AddUserDialogContent({ 
  formData, 
  handleInputChange, 
  handleSubmit, 
  onCancel,
  canCreateSuperAdmin = false,
  canCreateAdmin = false
}: AddUserDialogContentProps) {
  // Function to determine if a field can be edited
  const canEditField = (field: keyof UserFormData): boolean => {
    if (field === "role") {
      if (formData.role === "superadmin" && !canCreateSuperAdmin) return false;
      if (formData.role === "admin" && !canCreateAdmin) return false;
    }
    return true;
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-white">Add New User</DialogTitle>
      </DialogHeader>
      
      <ScrollableDialogContent maxHeight="65vh">
        <UserDetailsForm
          formData={formData}
          handleInputChange={handleInputChange}
          isEditable={true}
          canEditField={canEditField}
        />
      </ScrollableDialogContent>
      
      <div className="flex justify-end gap-3 mt-6">
        <Button
          variant="outline"
          onClick={onCancel}
          className="bg-spotify-accent hover:bg-spotify-accent-hover"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          className="bg-mywater-blue hover:bg-mywater-blue/90"
        >
          Add User
        </Button>
      </div>
    </>
  );
}
