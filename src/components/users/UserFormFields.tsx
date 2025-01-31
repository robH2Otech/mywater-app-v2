import { FormInput } from "@/components/shared/FormInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserFormFieldsProps {
  formData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company: string;
    job_title: string;
    role: string;
    status: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

export function UserFormFields({ formData, handleInputChange }: UserFormFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 py-4">
      <FormInput
        label="First Name"
        value={formData.first_name}
        onChange={(value) => handleInputChange("first_name", value)}
        required
      />
      <FormInput
        label="Company"
        value={formData.company}
        onChange={(value) => handleInputChange("company", value)}
      />
      <FormInput
        label="Last Name"
        value={formData.last_name}
        onChange={(value) => handleInputChange("last_name", value)}
        required
      />
      <FormInput
        label="Job Title"
        value={formData.job_title}
        onChange={(value) => handleInputChange("job_title", value)}
      />
      <FormInput
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => handleInputChange("email", value)}
        required
      />
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Role</label>
        <Select
          value={formData.role}
          onValueChange={(value) => handleInputChange("role", value)}
        >
          <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent className="bg-spotify-darker border-spotify-accent-hover">
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="technician">Technician</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <FormInput
        label="Phone"
        type="tel"
        value={formData.phone}
        onChange={(value) => handleInputChange("phone", value)}
      />
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Status</label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleInputChange("status", value)}
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