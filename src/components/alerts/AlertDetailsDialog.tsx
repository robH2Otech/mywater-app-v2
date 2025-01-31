import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AlertTriangle, Calendar, User, MessageSquare, FileText } from "lucide-react";

interface AlertDetailsDialogProps {
  alert: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlertDetailsDialog({ alert, open, onOpenChange }: AlertDetailsDialogProps) {
  const formatDate = (date: string | null) => {
    if (!date) return "Not specified";
    return format(new Date(date), "PPP");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-spotify-green';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-spotify-darker border-spotify-accent">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alert Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Status</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
              <AlertTriangle className={`h-4 w-4 ${getStatusColor(alert.status)}`} />
              <span className={`${getStatusColor(alert.status)} capitalize`}>{alert.status}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Created At</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-white">{formatDate(alert.created_at)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Assigned To</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-white">{alert.assign_to || "Not assigned"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Last Updated</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-white">{formatDate(alert.updated_at)}</span>
            </div>
          </div>

          <div className="col-span-2 space-y-2">
            <label className="text-sm text-gray-400">Message</label>
            <div className="flex items-start gap-2 px-3 py-2 bg-spotify-accent rounded-md">
              <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
              <span className="text-white">{alert.message || "No message"}</span>
            </div>
          </div>

          {alert.comments && (
            <div className="col-span-2 space-y-2">
              <label className="text-sm text-gray-400">Comments</label>
              <div className="flex items-start gap-2 px-3 py-2 bg-spotify-accent rounded-md">
                <FileText className="h-4 w-4 text-gray-400 mt-1" />
                <span className="text-white">{alert.comments}</span>
              </div>
            </div>
          )}
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