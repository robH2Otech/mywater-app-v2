
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { Mail, Send, FileText, Bell } from "lucide-react";
import { User, UserRole, UserStatus } from "@/types/users";

interface UserDetailsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserRole?: UserRole;
}

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

export function UserDetailsDialog({ user, open, onOpenChange, currentUserRole = "user" }: UserDetailsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UserFormData>({
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

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone || "",
        company: user.company || "",
        job_title: user.job_title || "",
        role: user.role,
        status: user.status,
        password: user.password || ""
      });
    }
  }, [user]);

  const isEditable = currentUserRole === "superadmin";

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    if (!isEditable) return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!user?.id) {
        throw new Error("User ID is required");
      }
      
      if (!isEditable) {
        throw new Error("Only Super Admins can edit user details");
      }

      const userDocRef = doc(db, "app_users", user.id);
      await updateDoc(userDocRef, {
        ...formData,
        updated_at: new Date().toISOString()
      });

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

  const handleAction = (action: 'email' | 'report' | 'reminder' | 'invoice') => {
    if (!user?.email) return;

    let subject = '';
    let body = '';

    switch (action) {
      case 'report':
        subject = 'Your Latest Report';
        body = 'Please find attached your latest report.';
        break;
      case 'reminder':
        subject = 'Reminder';
        body = 'This is a reminder for your upcoming tasks.';
        break;
      case 'invoice':
        subject = 'Invoice';
        body = 'Please find attached your latest invoice.';
        break;
      default:
        subject = '';
        body = '';
    }

    window.location.href = `mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-spotify-darker border-spotify-accent">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            User Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
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
            label="Password"
            type="password"
            value={formData.password}
            onChange={(value) => handleInputChange("password", value)}
            required={!user.id}
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

        <div className="flex justify-between mt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('email')}
              className="bg-spotify-accent hover:bg-spotify-accent-hover"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('report')}
              className="bg-spotify-accent hover:bg-spotify-accent-hover"
            >
              <FileText className="w-4 h-4 mr-2" />
              Send Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('reminder')}
              className="bg-spotify-accent hover:bg-spotify-accent-hover"
            >
              <Bell className="w-4 h-4 mr-2" />
              Send Reminder
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('invoice')}
              className="bg-spotify-accent hover:bg-spotify-accent-hover"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Invoice
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-spotify-accent hover:bg-spotify-accent-hover"
            >
              Cancel
            </Button>
            {isEditable && (
              <Button
                onClick={handleSubmit}
                className="bg-spotify-green hover:bg-spotify-green/90"
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
