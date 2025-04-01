
import { FormInput } from "@/components/shared/FormInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserFormData } from "@/hooks/users/useUserDetailsUpdate";
import { UserRole, UserStatus } from "@/types/users";

interface WorkDetailsTabProps {
  formData: UserFormData;
  handleInputChange: (field: keyof UserFormData, value: string) => void;
  isEditable: boolean;
}

export function WorkDetailsTab({ formData, handleInputChange, isEditable }: WorkDetailsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormInput
        label="Company"
        value={formData.company}
        onChange={(value) => handleInputChange("company", value)}
        disabled={!isEditable}
      />
      <FormInput
        label="Job Title"
        value={formData.job_title}
        onChange={(value) => handleInputChange("job_title", value)}
        disabled={!isEditable}
      />
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Role</label>
        <Select
          value={formData.role}
          onValueChange={(value: UserRole) => handleInputChange("role", value)}
          disabled={!isEditable}
        >
          <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent className="bg-spotify-darker border-spotify-accent-hover">
            <SelectItem value="superadmin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="technician">Technician</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Status</label>
        <Select
          value={formData.status}
          onValueChange={(value: UserStatus) => handleInputChange("status", value)}
          disabled={!isEditable}
        >
          <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="bg-spotify-darker border-spotify-accent-hover">
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
