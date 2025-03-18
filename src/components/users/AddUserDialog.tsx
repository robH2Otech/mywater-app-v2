
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UserRole, UserStatus } from "@/types/users";

interface FormData {
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

interface AddUserDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    job_title: "",
    role: "user",
    status: "active",
    password: ""
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.company) {
        throw new Error("First name, last name, email, password and company are required");
      }

      // Add user to Firebase
      const usersCollectionRef = collection(db, "app_users");
      await addDoc(usersCollectionRef, {
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "User has been added successfully",
      });

      // Reset form and close dialog
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        company: "",
        job_title: "",
        role: "user",
        status: "active",
        password: ""
      });
      
      if (onOpenChange) {
        onOpenChange(false);
      }

      // Refresh users list
      queryClient.invalidateQueries({ queryKey: ["users"] });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-spotify-darker border-spotify-accent">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Add New User</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <FormInput
            label="First Name"
            value={formData.first_name}
            onChange={(value) => handleInputChange("first_name", value)}
            required
          />
          <FormInput
            label="Last Name"
            value={formData.last_name}
            onChange={(value) => handleInputChange("last_name", value)}
            required
          />
          <FormInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange("email", value)}
            required
          />
          <FormInput
            label="Password"
            type="password"
            value={formData.password}
            onChange={(value) => handleInputChange("password", value)}
            required
            minLength={6}
          />
          <FormInput
            label="Phone"
            value={formData.phone}
            onChange={(value) => handleInputChange("phone", value)}
          />
          <FormInput
            label="Company"
            value={formData.company}
            onChange={(value) => handleInputChange("company", value)}
            required
          />
          <FormInput
            label="Job Title"
            value={formData.job_title}
            onChange={(value) => handleInputChange("job_title", value)}
          />
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Role</label>
            <Select
              value={formData.role}
              onValueChange={(value: UserRole) => handleInputChange("role", value)}
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
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            className="bg-spotify-accent hover:bg-spotify-accent-hover"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-spotify-green hover:bg-spotify-green/90"
          >
            Add User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
