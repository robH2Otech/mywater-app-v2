
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AlertTriangle, Calendar, User, MessageSquare, FileText } from "lucide-react";
import { FormInput } from "@/components/shared/FormInput";
import { FormDatePicker } from "@/components/shared/FormDatePicker";
import { useState, useEffect } from "react";
import { ScrollableDialogContent } from "@/components/shared/ScrollableDialogContent";
import { FieldCommentsList } from "@/components/comments/FieldCommentsList";
import { FieldCommentDialog } from "@/components/comments/FieldCommentDialog";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

interface AlertDetailsDialogProps {
  alert: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedData: any) => void;
}

export function AlertDetailsDialog({ alert, open, onOpenChange, onSave }: AlertDetailsDialogProps) {
  const [formData, setFormData] = useState<any>(null);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const { userRole } = useFirebaseAuth();
  
  // Check if user can edit alerts (admin or superadmin)
  const canEdit = userRole === "superadmin" || userRole === "admin";
  
  // Check if user can add comments (admin, superadmin, or technician)
  const canAddComments = canEdit || userRole === "technician";

  useEffect(() => {
    if (alert) {
      setFormData({
        name: alert.name,
        location: alert.location || "",
        total_volume: alert.total_volume?.toString() || "",
        status: alert.status || "active",
        contact_name: alert.contact_name || "",
        contact_email: alert.contact_email || "",
        contact_phone: alert.contact_phone || "",
        next_maintenance: alert.next_maintenance ? new Date(alert.next_maintenance) : null,
      });
    }
  }, [alert]);

  const handleSave = () => {
    if (onSave && formData) {
      onSave({
        ...formData,
        total_volume: formData.total_volume ? parseFloat(formData.total_volume) : null,
      });
    }
  };

  if (!alert || !formData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-spotify-darker border-spotify-accent overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alert Details
          </DialogTitle>
        </DialogHeader>

        <ScrollableDialogContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <FormInput
              label="Name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              readOnly={!canEdit}
            />

            <FormInput
              label="Location"
              value={formData.location}
              onChange={(value) => setFormData({ ...formData, location: value })}
              readOnly={!canEdit}
            />

            <FormInput
              label="Total Volume (m³)"
              type="number"
              value={formData.total_volume}
              onChange={(value) => setFormData({ ...formData, total_volume: value })}
              readOnly={!canEdit}
            />

            <FormDatePicker
              label="Next Maintenance"
              value={formData.next_maintenance}
              onChange={(date) => setFormData({ ...formData, next_maintenance: date })}
              disabled={!canEdit}
            />

            <FormInput
              label="Contact Name"
              value={formData.contact_name}
              onChange={(value) => setFormData({ ...formData, contact_name: value })}
              readOnly={!canEdit}
            />

            <FormInput
              label="Email"
              type="email"
              value={formData.contact_email}
              onChange={(value) => setFormData({ ...formData, contact_email: value })}
              readOnly={!canEdit}
            />

            <FormInput
              label="Phone"
              value={formData.contact_phone}
              onChange={(value) => setFormData({ ...formData, contact_phone: value })}
              readOnly={!canEdit}
            />
          </div>

          {/* Field Comments Section */}
          <div className="mt-6 border-t border-spotify-accent/30 pt-4">
            <FieldCommentsList 
              entityId={alert.id} 
              entityType="alert" 
              onAddComment={() => setIsCommentDialogOpen(true)}
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="bg-spotify-accent hover:bg-spotify-accent-hover text-white"
            >
              {canEdit ? "Cancel" : "Close"}
            </Button>
            {canEdit && (
              <Button
                onClick={handleSave}
                className="bg-mywater-blue hover:bg-mywater-blue/90 text-white"
              >
                Save Changes
              </Button>
            )}
          </div>
        </ScrollableDialogContent>
      </DialogContent>

      {/* Field Comment Dialog */}
      <FieldCommentDialog 
        open={isCommentDialogOpen}
        onOpenChange={setIsCommentDialogOpen}
        entityId={alert.id}
        entityType="alert"
      />
    </Dialog>
  );
}
