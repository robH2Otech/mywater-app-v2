
import { FormInput } from "@/components/shared/FormInput";
import { UserFormData } from "@/hooks/users/useUserDetailsUpdate";

interface BasicInfoTabProps {
  formData: UserFormData;
  handleInputChange: (field: keyof UserFormData, value: string) => void;
  isEditable: boolean;
}

export function BasicInfoTab({ formData, handleInputChange, isEditable }: BasicInfoTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormInput
        label="First Name"
        value={formData.first_name}
        onChange={(value) => handleInputChange("first_name", value)}
        required
        disabled={!isEditable}
      />
      <FormInput
        label="Last Name"
        value={formData.last_name}
        onChange={(value) => handleInputChange("last_name", value)}
        required
        disabled={!isEditable}
      />
      <FormInput
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => handleInputChange("email", value)}
        required
        disabled={!isEditable}
      />
      <FormInput
        label="Phone"
        value={formData.phone}
        onChange={(value) => handleInputChange("phone", value)}
        disabled={!isEditable}
      />
    </div>
  );
}
