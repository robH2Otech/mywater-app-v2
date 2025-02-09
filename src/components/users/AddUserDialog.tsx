import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

type UserRole = "admin" | "technician" | "user";
type UserStatus = "active" | "inactive" | "pending";

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  role: UserRole;
  status: UserStatus;
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
    status: "active"
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from("app_users")
        .insert(formData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User has been added successfully",
      });

      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        company: "",
        job_title: "",
        role: "user",
        status: "active"
      });
      
      // Close dialog if onOpenChange is provided
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
      <DialogTrigger asChild>
        <Button className="bg-spotify-green hover:bg-spotify-green/90">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-spotify-darker">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New User</DialogTitle>
        </DialogHeader>
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
              onValueChange={(value: UserRole) => handleInputChange("role", value)}
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
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            className="bg-spotify-green hover:bg-spotify-green/90"
            onClick={handleSubmit}
          >
            Add User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}