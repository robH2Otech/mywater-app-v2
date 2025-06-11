
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  password?: string;
}

interface UserDetailsFormProps {
  formData: UserFormData;
  handleInputChange: (field: keyof UserFormData, value: string) => void;
  isEditable: boolean;
  canEditField: (field: keyof UserFormData) => boolean;
  showPasswordField?: boolean;
}

export function UserDetailsForm({ 
  formData, 
  handleInputChange, 
  isEditable,
  canEditField,
  showPasswordField = false
}: UserDetailsFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name" className="text-white">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => handleInputChange("first_name", e.target.value)}
            className="bg-spotify-accent border-spotify-accent text-white"
            disabled={!isEditable || !canEditField("first_name")}
          />
        </div>
        <div>
          <Label htmlFor="last_name" className="text-white">Last Name *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => handleInputChange("last_name", e.target.value)}
            className="bg-spotify-accent border-spotify-accent text-white"
            disabled={!isEditable || !canEditField("last_name")}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email" className="text-white">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className="bg-spotify-accent border-spotify-accent text-white"
          disabled={!isEditable || !canEditField("email")}
        />
      </div>

      <div>
        <Label htmlFor="phone" className="text-white">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          className="bg-spotify-accent border-spotify-accent text-white"
          disabled={!isEditable || !canEditField("phone")}
        />
      </div>

      <div>
        <Label htmlFor="company" className="text-white">Company *</Label>
        <Input
          id="company"
          value={formData.company}
          onChange={(e) => handleInputChange("company", e.target.value)}
          className="bg-spotify-accent border-spotify-accent text-white"
          disabled={!isEditable || !canEditField("company")}
        />
      </div>

      <div>
        <Label htmlFor="job_title" className="text-white">Job Title</Label>
        <Input
          id="job_title"
          value={formData.job_title}
          onChange={(e) => handleInputChange("job_title", e.target.value)}
          className="bg-spotify-accent border-spotify-accent text-white"
          disabled={!isEditable || !canEditField("job_title")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="role" className="text-white">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => handleInputChange("role", value)}
            disabled={!isEditable || !canEditField("role")}
          >
            <SelectTrigger className="bg-spotify-accent border-spotify-accent text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="technician">Technician</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="superadmin">Superadmin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status" className="text-white">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange("status", value)}
            disabled={!isEditable || !canEditField("status")}
          >
            <SelectTrigger className="bg-spotify-accent border-spotify-accent text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {showPasswordField && (
        <div>
          <Label htmlFor="password" className="text-white">Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password || ""}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className="bg-spotify-accent border-spotify-accent text-white"
            disabled={!isEditable || !canEditField("password")}
          />
        </div>
      )}
    </div>
  );
}
