
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface CreateAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAlert: () => void;
}

export const CreateAlertDialog = ({
  open,
  onOpenChange,
  onCreateAlert,
}: CreateAlertDialogProps) => {
  const [status, setStatus] = useState("attention");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-spotify-darker text-white sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create Alert</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* First Row */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Unit ID</label>
              <Input 
                placeholder="Enter unit ID"
                className="bg-spotify-accent border-spotify-accent h-9 md:h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-spotify-accent border-spotify-accent h-9 md:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-spotify-darker border-spotify-accent">
                  <SelectItem value="attention">Attention</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Second Row */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Message</label>
              <Input 
                placeholder="Enter alert message"
                className="bg-spotify-accent border-spotify-accent h-9 md:h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Assign To</label>
              <Input 
                placeholder="Enter assignee"
                className="bg-spotify-accent border-spotify-accent h-9 md:h-10"
              />
            </div>
          </div>

          {/* Full Width Comments Area */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Comments</label>
            <Textarea 
              placeholder="Enter any additional comments"
              className="bg-spotify-accent border-spotify-accent min-h-[80px]"
            />
          </div>

          <Button 
            className="w-full bg-spotify-green hover:bg-spotify-green/90"
            onClick={() => {
              onCreateAlert();
              onOpenChange(false);
            }}
          >
            Create Alert
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
