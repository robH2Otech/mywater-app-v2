
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserDetailsForm } from "./UserDetailsForm";
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
}

interface AddUserDialogContentProps {
  formData: UserFormData;
  handleInputChange: (field: keyof UserFormData, value: string) => void;
  handleSubmit: () => void;
  onCancel: () => void;
  canCreateSuperAdmin?: boolean;
  canCreateAdmin?: boolean;
  isSubmitting: boolean;
}

export function AddUserDialogContent({ 
  formData, 
  handleInputChange, 
  handleSubmit, 
  onCancel,
  canCreateSuperAdmin = false,
  canCreateAdmin = false,
  isSubmitting
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
    <div className="flex flex-col h-full">
      <DialogHeader className="px-6 py-4 border-b border-spotify-accent shrink-0">
        <DialogTitle className="text-xl font-semibold text-white">Invite New User</DialogTitle>
      </DialogHeader>
      
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <UserDetailsForm
          formData={formData}
          handleInputChange={handleInputChange}
          isEditable={true}
          canEditField={canEditField}
        />
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This will create a user invitation. The user will need to sign up with their email address to activate their account.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-spotify-accent bg-spotify-darker shrink-0">
        <Button
          variant="outline"
          onClick={onCancel}
          className="bg-spotify-accent hover:bg-spotify-accent-hover text-white border-none"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          className="bg-mywater-blue hover:bg-mywater-blue/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Inviting..." : "Invite User"}
        </Button>
      </div>
    </div>
  );
}
