
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { FormInput } from "@/components/shared/FormInput";
import { FormDatePicker } from "@/components/shared/FormDatePicker";
import { useState, useEffect } from "react";
import { ScrollableDialogContent } from "@/components/shared/ScrollableDialogContent";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { FieldCommentsList } from "@/components/comments/FieldCommentsList";
import { FieldCommentDialog } from "@/components/comments/FieldCommentDialog";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

interface FilterDetailsDialogProps {
  filter: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedData: any) => void;
}

export function FilterDetailsDialog({ filter, open, onOpenChange, onSave }: FilterDetailsDialogProps) {
  const [formData, setFormData] = useState<any>(null);
  const [unitType, setUnitType] = useState<string>('uvc');
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const { userRole } = useFirebaseAuth();
  
  // Check if user can edit filters (admin or superadmin)
  const canEdit = userRole === "superadmin" || userRole === "admin";
  
  // Check if user can add comments (admin, superadmin, or technician)
  const canAddComments = canEdit || userRole === "technician";

  // Fetch unit type when filter changes
  useEffect(() => {
    const fetchUnitType = async () => {
      if (filter?.unit_id) {
        const unitDoc = await getDoc(doc(db, "units", filter.unit_id));
        if (unitDoc.exists()) {
          const unit = unitDoc.data();
          setUnitType(unit.unit_type || 'uvc');
        }
      }
    };
    fetchUnitType();
  }, [filter]);

  useEffect(() => {
    if (filter) {
      setFormData({
        name: filter.name,
        location: filter.location || "",
        total_volume: filter.total_volume?.toString() || "",
        status: filter.status || "active",
        contact_name: filter.contact_name || "",
        contact_email: filter.contact_email || "",
        contact_phone: filter.contact_phone || "",
        next_maintenance: filter.next_maintenance ? new Date(filter.next_maintenance) : null,
      });
    }
  }, [filter]);

  const handleSave = () => {
    if (onSave && formData) {
      onSave({
        ...formData,
        total_volume: formData.total_volume ? parseFloat(formData.total_volume) : null,
      });
    }
  };

  if (!filter || !formData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-hidden bg-spotify-darker border-spotify-accent">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Details
          </DialogTitle>
        </DialogHeader>

        <ScrollableDialogContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              label={`Total Volume (${unitType === 'drop' || unitType === 'office' ? 'L' : 'm³'})`}
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
              entityId={filter.id} 
              entityType="filter" 
              onAddComment={() => setIsCommentDialogOpen(true)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
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
                Save
              </Button>
            )}
          </div>
        </ScrollableDialogContent>
      </DialogContent>

      {/* Field Comment Dialog */}
      <FieldCommentDialog
        open={isCommentDialogOpen}
        onOpenChange={setIsCommentDialogOpen}
        entityId={filter.id}
        entityType="filter"
      />
    </Dialog>
  );
}
