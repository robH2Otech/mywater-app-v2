
import { FormInput } from "@/components/shared/FormInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface UserDetailsFormProps {
  formData: UserFormData;
  handleInputChange: (field: keyof UserFormData, value: string) => void;
  isEditable?: boolean;
  canEditField?: (field: keyof UserFormData) => boolean;
}

export function UserDetailsForm({ 
  formData, 
  handleInputChange, 
  isEditable = true,
  canEditField = () => true
}: UserDetailsFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          value={formData.first_name}
          onChange={(value) => handleInputChange("first_name", value)}
          placeholder="Enter first name"
          required
          disabled={!isEditable || !canEditField("first_name")}
        />
        
        <FormInput
          label="Last Name"
          value={formData.last_name}
          onChange={(value) => handleInputChange("last_name", value)}
          placeholder="Enter last name"
          required
          disabled={!isEditable || !canEditField("last_name")}
        />
        
        <FormInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(value) => handleInputChange("email", value)}
          placeholder="Enter email address"
          required
          disabled={!isEditable || !canEditField("email")}
          className="col-span-1 md:col-span-2"
        />
        
        <FormInput
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(value) => handleInputChange("phone", value)}
          placeholder="Enter phone number"
          disabled={!isEditable || !canEditField("phone")}
        />
        
        <FormInput
          label="Company"
          value={formData.company}
          onChange={(value) => handleInputChange("company", value)}
          placeholder="Enter company name"
          required
          disabled={!isEditable || !canEditField("company")}
        />
        
        <FormInput
          label="Job Title"
          value={formData.job_title}
          onChange={(value) => handleInputChange("job_title", value)}
          placeholder="Enter job title"
          disabled={!isEditable || !canEditField("job_title")}
        />
        
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400">Role</label>
          <Select
            value={formData.role}
            onValueChange={(value) => handleInputChange("role", value as UserRole)}
            disabled={!isEditable || !canEditField("role")}
          >
            <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white h-9">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="bg-spotify-darker border-spotify-accent">
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="superadmin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400">Status</label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange("status", value as UserStatus)}
            disabled={!isEditable || !canEditField("status")}
          >
            <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white h-9">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-spotify-darker border-spotify-accent">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
