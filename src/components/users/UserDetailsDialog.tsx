
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

interface UserDetailsDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    company: user?.company || "",
    job_title: user?.job_title || "",
    role: user?.role || "user",
    status: user?.status || "active"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!user?.id) {
        throw new Error("User ID is required");
      }
      
      const userDocRef = doc(db, "app_users", user.id);
      await updateDoc(userDocRef, formData);

      toast({
        title: "Success",
        description: "User details updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["users"] });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-spotify-darker border-spotify-accent">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Edit User Details
          </DialogTitle>
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
            label="Phone"
            value={formData.phone}
            onChange={(value) => handleInputChange("phone", value)}
          />
          <FormInput
            label="Company"
            value={formData.company}
            onChange={(value) => handleInputChange("company", value)}
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

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-spotify-accent hover:bg-spotify-accent-hover"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-spotify-green hover:bg-spotify-green/90"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
