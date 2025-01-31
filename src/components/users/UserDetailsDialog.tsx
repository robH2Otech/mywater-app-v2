import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { User, Mail, Phone, Building2, Briefcase, Calendar, CheckCircle2 } from "lucide-react";

interface UserDetailsDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  const formatDate = (date: string | null) => {
    if (!date) return "Not specified";
    return format(new Date(date), "PPP");
  };

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
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Full Name</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-white">{`${user.first_name} ${user.last_name}`}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Email</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-white">{user.email}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Role</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
              <Briefcase className="h-4 w-4 text-gray-400" />
              <span className="text-white capitalize">{user.role}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Status</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
              <CheckCircle2 className="h-4 w-4 text-gray-400" />
              <span className="text-white capitalize">{user.status}</span>
            </div>
          </div>

          {user.phone && (
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Phone</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-white">{user.phone}</span>
              </div>
            </div>
          )}

          {user.company && (
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Company</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="text-white">{user.company}</span>
              </div>
            </div>
          )}

          {user.job_title && (
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Job Title</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
                <Briefcase className="h-4 w-4 text-gray-400" />
                <span className="text-white">{user.job_title}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Member Since</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-white">{formatDate(user.created_at)}</span>
            </div>
          </div>
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