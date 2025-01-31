import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, User, MessageSquare } from "lucide-react";
import { AlertStatusField } from "./AlertStatusField";
import { AlertDateField } from "./AlertDateField";
import { AlertTextField } from "./AlertTextField";

interface AlertDetailsDialogProps {
  alert: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlertDetailsDialog({ alert, open, onOpenChange }: AlertDetailsDialogProps) {
  if (!alert) return null;

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
          <AlertStatusField status={alert.status} />
          <AlertDateField label="Created At" date={alert.created_at} />
          <AlertTextField 
            label="Assigned To" 
            value={alert.assign_to} 
            icon={User}
          />
          <AlertDateField label="Last Updated" date={alert.updated_at} />
          
          <div className="col-span-2">
            <AlertTextField 
              label="Message" 
              value={alert.message} 
              icon={MessageSquare}
            />
          </div>

          {alert.comments && (
            <div className="col-span-2">
              <AlertTextField 
                label="Comments" 
                value={alert.comments} 
                icon={MessageSquare}
              />
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