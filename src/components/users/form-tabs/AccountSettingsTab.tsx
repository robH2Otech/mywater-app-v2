
import { FormInput } from "@/components/shared/FormInput";
import { UserFormData } from "@/hooks/users/useUserDetailsUpdate";

interface AccountSettingsTabProps {
  formData: UserFormData;
  handleInputChange: (field: keyof UserFormData, value: string) => void;
  isEditable: boolean;
}

export function AccountSettingsTab({ formData, handleInputChange, isEditable }: AccountSettingsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormInput
        label="Password"
        type="password"
        value={formData.password}
        onChange={(value) => handleInputChange("password", value)}
        required={false}
        disabled={!isEditable}
        className="col-span-1 md:col-span-2"
      />
    </div>
  );
}
