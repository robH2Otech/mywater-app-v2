import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Filter, Calendar, Mail, Phone, User, FileText } from "lucide-react";

interface FilterDetailsDialogProps {
  filter: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FilterDetailsDialog({ filter, open, onOpenChange }: FilterDetailsDialogProps) {
  const formatDate = (date: string | null) => {
    if (!date) return "Not specified";
    return format(new Date(date), "PPP");
  };

  // If filter is null, don't render the dialog content
  if (!filter) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-spotify-darker border-spotify-accent">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Installation Date</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-white">{formatDate(filter.installation_date)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Last Change</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-white">{formatDate(filter.last_change)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Next Change</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-white">{formatDate(filter.next_change)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Volume Processed (m³)</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-white">{filter.volume_processed || "0"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Contact Name</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-white">{filter.contact_name || "Not specified"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Email</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-white">{filter.email || "Not specified"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Phone</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-spotify-accent rounded-md">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-white">{filter.phone || "Not specified"}</span>
            </div>
          </div>
        </div>

        {filter.notes && (
          <div className="space-y-2 mt-6">
            <label className="text-sm text-gray-400">Notes</label>
            <div className="flex items-start gap-2 px-3 py-2 bg-spotify-accent rounded-md">
              <FileText className="h-4 w-4 text-gray-400 mt-1" />
              <span className="text-white">{filter.notes}</span>
            </div>
          </div>
        )}

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