
import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserDetailsForm } from "./UserDetailsForm";
import { FormSlider } from "@/components/shared/FormSlider";
import { User, UserRole } from "@/types/users";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

interface UserDialogLayoutProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  handleInputChange: (field: string, value: string) => void;
  isEditable: boolean;
  canEditField: (field: string) => boolean;
  isSubmitting: boolean;
  handleSubmit: () => void;
}

export function UserDialogLayout({
  user,
  open,
  onOpenChange,
  formData,
  handleInputChange,
  isEditable,
  canEditField,
  isSubmitting,
  handleSubmit
}: UserDialogLayoutProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "superadmin":
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
      case "admin":
        return <ShieldCheck className="h-5 w-5 text-blue-400" />;
      case "technician":
        return <Shield className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] bg-spotify-darker border-spotify-accent p-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[90vh]">
          <DialogHeader className="px-6 py-4 border-b border-spotify-accent shrink-0">
            <div className="flex items-center gap-2">
              {getRoleIcon(user.role)}
              <DialogTitle className="text-xl font-semibold text-white">
                User Details {user.company && `(${user.company})`}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-6 py-4 min-h-0"
          >
            <UserDetailsForm 
              formData={formData}
              handleInputChange={handleInputChange}
              isEditable={isEditable}
              canEditField={canEditField}
            />
          </div>

          <div className="px-6">
            <FormSlider containerRef={scrollContainerRef} />
          </div>

          <div className="shrink-0 border-t border-spotify-accent bg-spotify-darker px-6 py-4">
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-spotify-accent hover:bg-spotify-accent-hover text-white border-none"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              {isEditable && (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-mywater-blue hover:bg-mywater-blue/90"
                >
                  {isSubmitting ? "Updating..." : "Save Changes"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
