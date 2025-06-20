
import { User } from "@/types/users";
import { useUserPermissionLogic } from "./UserPermissionLogic";
import { useUserFormHandler } from "./UserFormHandler";
import { UserDialogLayout } from "./UserDialogLayout";

interface UserDetailsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  const { canEditUser, canEditField } = useUserPermissionLogic({ user });
  const { formData, isSubmitting, handleInputChange, handleSubmit } = useUserFormHandler({ 
    user, 
    isEditable: canEditUser, 
    onClose: () => onOpenChange(false) 
  });

  const canEditFieldWrapper = (field: string) => {
    return canEditField(field, formData.role);
  };

  return (
    <UserDialogLayout
      user={user}
      open={open}
      onOpenChange={onOpenChange}
      formData={formData}
      handleInputChange={handleInputChange}
      isEditable={canEditUser}
      canEditField={canEditFieldWrapper}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
    />
  );
}
