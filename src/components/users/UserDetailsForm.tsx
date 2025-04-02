
import { FormInput } from "@/components/shared/FormInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UserRole, UserStatus } from "@/types/users";
import { useIsMobile } from "@/hooks/use-mobile";

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

interface UserDetailsFormProps {
  formData: UserFormData;
  handleInputChange: (field: keyof UserFormData, value: string) => void;
  isEditable: boolean;
}

export function UserDetailsForm({ formData, handleInputChange, isEditable }: UserDetailsFormProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-3'} py-1`}>
      <FormInput
        label="First Name"
        labelClassName="text-xs"
        value={formData.first_name}
        onChange={(value) => handleInputChange("first_name", value)}
        required
        disabled={!isEditable}
        inputClassName="h-8 text-sm"
      />
      <FormInput
        label="Last Name"
        labelClassName="text-xs"
        value={formData.last_name}
        onChange={(value) => handleInputChange("last_name", value)}
        required
        disabled={!isEditable}
        inputClassName="h-8 text-sm"
      />
      <FormInput
        label="Email"
        labelClassName="text-xs"
        type="email"
        value={formData.email}
        onChange={(value) => handleInputChange("email", value)}
        required
        disabled={!isEditable}
        className={isMobile ? "" : "col-span-2"}
        inputClassName="h-8 text-sm"
      />
      <FormInput
        label="Password"
        labelClassName="text-xs"
        type="password"
        value={formData.password}
        onChange={(value) => handleInputChange("password", value)}
        required={false}
        disabled={!isEditable}
        className={isMobile ? "" : "col-span-2"}
        inputClassName="h-8 text-sm"
      />
      <FormInput
        label="Phone"
        labelClassName="text-xs"
        value={formData.phone}
        onChange={(value) => handleInputChange("phone", value)}
        disabled={!isEditable}
        inputClassName="h-8 text-sm"
      />
      <FormInput
        label="Company"
        labelClassName="text-xs"
        value={formData.company}
        onChange={(value) => handleInputChange("company", value)}
        disabled={!isEditable}
        inputClassName="h-8 text-sm"
      />
      <FormInput
        label="Job Title"
        labelClassName="text-xs"
        value={formData.job_title}
        onChange={(value) => handleInputChange("job_title", value)}
        disabled={!isEditable}
        inputClassName="h-8 text-sm"
      />
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-400 block">Role</label>
        <Select
          value={formData.role}
          onValueChange={(value: UserRole) => handleInputChange("role", value)}
          disabled={!isEditable}
        >
          <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white h-8 text-sm">
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
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-400 block">Status</label>
        <Select
          value={formData.status}
          onValueChange={(value: UserStatus) => handleInputChange("status", value)}
          disabled={!isEditable}
        >
          <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white h-8 text-sm">
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
