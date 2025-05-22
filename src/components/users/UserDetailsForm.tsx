
import { FormInput } from "@/components/shared/FormInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UserRole, UserStatus } from "@/types/users";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";

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
  canEditField?: (field: keyof UserFormData) => boolean;
}

export function UserDetailsForm({ 
  formData, 
  handleInputChange, 
  isEditable,
  canEditField = () => isEditable
}: UserDetailsFormProps) {
  const isMobile = useIsMobile();
  const { isSuperAdmin } = usePermissions();
  
  const getRoleBadgeColor = (role: UserRole) => {
    switch(role) {
      case "superadmin": return "bg-red-500/80 hover:bg-red-600";
      case "admin": return "bg-blue-500/80 hover:bg-blue-600";
      case "technician": return "bg-yellow-500/80 hover:bg-yellow-600";
      case "user": 
      default: return "bg-green-500/80 hover:bg-green-600";
    }
  };
  
  return (
    <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-3'} py-1`}>
      <FormInput
        label="First Name"
        labelClassName="text-xs"
        value={formData.first_name}
        onChange={(value) => handleInputChange("first_name", value)}
        required
        disabled={!canEditField("first_name")}
        inputClassName="h-8 text-sm"
      />
      <FormInput
        label="Last Name"
        labelClassName="text-xs"
        value={formData.last_name}
        onChange={(value) => handleInputChange("last_name", value)}
        required
        disabled={!canEditField("last_name")}
        inputClassName="h-8 text-sm"
      />
      <FormInput
        label="Email"
        labelClassName="text-xs"
        type="email"
        value={formData.email}
        onChange={(value) => handleInputChange("email", value)}
        required
        disabled={!canEditField("email")}
        className={isMobile ? "" : "col-span-2"}
        inputClassName="h-8 text-sm"
      />
      
      {canEditField("password") && (
        <FormInput
          label="Password"
          labelClassName="text-xs"
          type="password"
          value={formData.password}
          onChange={(value) => handleInputChange("password", value)}
          required={false}
          disabled={!canEditField("password")}
          className={isMobile ? "" : "col-span-2"}
          inputClassName="h-8 text-sm"
          placeholder={formData.password ? "••••••••" : "Leave blank to keep unchanged"}
        />
      )}
      
      <FormInput
        label="Phone"
        labelClassName="text-xs"
        value={formData.phone}
        onChange={(value) => handleInputChange("phone", value)}
        disabled={!canEditField("phone")}
        inputClassName="h-8 text-sm"
      />
      
      <FormInput
        label="Company"
        labelClassName="text-xs"
        value={formData.company}
        onChange={(value) => handleInputChange("company", value)}
        disabled={!canEditField("company")}
        inputClassName="h-8 text-sm"
        required
      />
      
      <FormInput
        label="Job Title"
        labelClassName="text-xs"
        value={formData.job_title}
        onChange={(value) => handleInputChange("job_title", value)}
        disabled={!canEditField("job_title")}
        inputClassName="h-8 text-sm"
      />
      
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-400 block flex items-center justify-between">
          <span>Role</span>
          {!canEditField("role") && (
            <Badge className={`${getRoleBadgeColor(formData.role)} text-[10px]`}>
              {formData.role.toUpperCase()}
            </Badge>
          )}
        </label>
        {canEditField("role") ? (
          <Select
            value={formData.role}
            onValueChange={(value: UserRole) => handleInputChange("role", value)}
            disabled={!canEditField("role")}
          >
            <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white h-8 text-sm">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="bg-spotify-darker border-spotify-accent-hover">
              {isSuperAdmin() && <SelectItem value="superadmin">Super Admin</SelectItem>}
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="technician">Technician</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="h-8 flex items-center text-gray-400 text-sm">
            {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-400 block">Status</label>
        {canEditField("status") ? (
          <Select
            value={formData.status}
            onValueChange={(value: UserStatus) => handleInputChange("status", value)}
            disabled={!canEditField("status")}
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
        ) : (
          <div className="h-8 flex items-center text-gray-400 text-sm">
            {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
          </div>
        )}
      </div>
    </div>
  );
}
