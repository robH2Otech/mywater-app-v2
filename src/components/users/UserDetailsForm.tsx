
import { FormInput } from "@/components/shared/FormInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserRole, UserStatus } from "@/types/users";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="bg-spotify-accent border-spotify-accent-hover mb-6 w-full">
        <TabsTrigger 
          value="general" 
          className="flex-1 data-[state=active]:bg-mywater-blue data-[state=active]:text-white"
        >
          General Information
        </TabsTrigger>
        <TabsTrigger 
          value="access" 
          className="flex-1 data-[state=active]:bg-mywater-blue data-[state=active]:text-white"
        >
          Access & Roles
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="pt-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
      </TabsContent>
      
      <TabsContent value="access" className="pt-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          
          <FormInput
            label="Password"
            type="password"
            value={formData.password}
            onChange={(value) => handleInputChange("password", value)}
            placeholder={formData.password ? "••••••••" : "Enter new password"}
            required={false}
            disabled={!isEditable}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
