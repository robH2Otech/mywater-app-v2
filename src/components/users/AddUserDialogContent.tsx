
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserDetailsForm } from "./UserDetailsForm";
import { FormSlider } from "@/components/shared/FormSlider";
import { UserRole, UserStatus } from "@/types/users";
import { useRef } from "react";
import { FormInput } from "@/components/shared/FormInput";
import { RefreshCw, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/utils/admin/passwordUtils";

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

interface AddUserDialogContentProps {
  formData: UserFormData;
  handleInputChange: (field: keyof UserFormData, value: string) => void;
  handleSubmit: () => void;
  onCancel: () => void;
  canCreateSuperAdmin?: boolean;
  canCreateAdmin?: boolean;
  isSubmitting: boolean;
  onGeneratePassword: () => void;
}

export function AddUserDialogContent({ 
  formData, 
  handleInputChange, 
  handleSubmit, 
  onCancel,
  canCreateSuperAdmin = false,
  canCreateAdmin = false,
  isSubmitting,
  onGeneratePassword
}: AddUserDialogContentProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const canEditField = (field: keyof UserFormData): boolean => {
    if (field === "role") {
      if (formData.role === "superadmin" && !canCreateSuperAdmin) return false;
      if (formData.role === "admin" && !canCreateAdmin) return false;
    }
    return true;
  };

  const handleCopyPassword = async () => {
    const success = await copyToClipboard(formData.password);
    if (success) {
      toast({
        title: "Copied!",
        description: "Password copied to clipboard",
      });
    } else {
      toast({
        title: "Failed",
        description: "Failed to copy password to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      <DialogHeader className="px-6 py-4 border-b border-spotify-accent shrink-0">
        <DialogTitle className="text-xl font-semibold text-white">Create New User</DialogTitle>
      </DialogHeader>
      
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 min-h-0"
      >
        <UserDetailsForm
          formData={formData}
          handleInputChange={handleInputChange}
          isEditable={true}
          canEditField={canEditField}
        />
        
        {/* Password Section */}
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium text-white">Login Credentials</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="flex gap-2">
                <FormInput
                  label=""
                  type="text"
                  value={formData.password}
                  onChange={(value) => handleInputChange('password', value)}
                  placeholder="User password"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onGeneratePassword}
                  className="bg-spotify-accent hover:bg-spotify-accent-hover border-none"
                  title="Generate new password"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyPassword}
                  className="bg-spotify-accent hover:bg-spotify-accent-hover border-none"
                  title="Copy password"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This will create a complete user account with login credentials. The user will receive an email with their login details and can sign in immediately at: <strong>https://x-water-v2.lovable.app/</strong>
          </p>
        </div>
      </div>
      
      <div className="px-6">
        <FormSlider containerRef={scrollContainerRef} />
      </div>
      
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-spotify-accent bg-spotify-darker shrink-0">
        <Button
          variant="outline"
          onClick={onCancel}
          className="bg-spotify-accent hover:bg-spotify-accent-hover text-white border-none"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          className="bg-mywater-blue hover:bg-mywater-blue/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating User..." : "Create User & Send Invitation"}
        </Button>
      </div>
    </div>
  );
}
