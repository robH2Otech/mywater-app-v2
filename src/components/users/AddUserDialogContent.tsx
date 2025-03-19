
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
}

export function AddUserDialogContent({ 
  formData, 
  handleInputChange, 
  handleSubmit, 
  onCancel 
}: AddUserDialogContentProps) {
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
          className="bg-spotify-green hover:bg-spotify-green/90"
        >
          Add User
        </Button>
      </div>
    </>
  );
}
