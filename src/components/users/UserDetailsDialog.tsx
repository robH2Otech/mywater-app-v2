import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Building2, Briefcase, Calendar, CheckCircle2 } from "lucide-react";
import { UserInfoField } from "./UserInfoField";
import { format } from "date-fns";

interface UserDetailsDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-spotify-darker border-spotify-accent">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            User Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <UserInfoField
            label="Full Name"
            value={`${user.first_name} ${user.last_name}`}
            icon={User}
          />
          <UserInfoField
            label="Email"
            value={user.email}
            icon={Mail}
          />
          <UserInfoField
            label="Role"
            value={user.role}
            icon={Briefcase}
          />
          <UserInfoField
            label="Status"
            value={user.status}
            icon={CheckCircle2}
          />
          {user.phone && (
            <UserInfoField
              label="Phone"
              value={user.phone}
              icon={Phone}
            />
          )}
          {user.company && (
            <UserInfoField
              label="Company"
              value={user.company}
              icon={Building2}
            />
          )}
          {user.job_title && (
            <UserInfoField
              label="Job Title"
              value={user.job_title}
              icon={Briefcase}
            />
          )}
          <UserInfoField
            label="Member Since"
            value={format(new Date(user.created_at), "PPP")}
            icon={Calendar}
          />
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-spotify-accent hover:bg-spotify-accent-hover text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}