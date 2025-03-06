
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UnitFormFields } from "./UnitFormFields";
import { UnitFormActions } from "./UnitFormActions";
import { useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUnitStatus, createAlertMessage } from "@/utils/unitStatusUtils";

interface EditUnitDialogProps {
  unit: {
    id: string;
    name: string;
    location: string | null;
    total_volume: number | string | null;
    status: string;
    contact_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    next_maintenance: string | null;
    eid?: string | null;
    iccid?: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUnitDialog({ unit, open, onOpenChange }: EditUnitDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: unit.name,
    location: unit.location || "",
    total_volume: unit.total_volume?.toString() || "",
    status: unit.status || "active",
    contact_name: unit.contact_name || "",
    contact_email: unit.contact_email || "",
    contact_phone: unit.contact_phone || "",
    next_maintenance: unit.next_maintenance ? new Date(unit.next_maintenance) : null,
    eid: unit.eid || "",
    iccid: unit.iccid || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.total_volume) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse volume to numeric value
      const numericVolume = parseFloat(formData.total_volume);
      
      // Determine the new status based on the updated volume
      const newStatus = determineUnitStatus(numericVolume);
      
      // Update the unit document
      const unitDocRef = doc(db, "units", unit.id);
      await updateDoc(unitDocRef, {
        name: formData.name,
        location: formData.location || null,
        total_volume: numericVolume,
        status: newStatus,
        contact_name: formData.contact_name || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        next_maintenance: formData.next_maintenance?.toISOString() || null,
        eid: formData.eid || null,
        iccid: formData.iccid || null,
        updated_at: new Date().toISOString(),
      });

      // Check if the new status requires an alert
      if (newStatus === 'warning' || newStatus === 'urgent') {
        // Only create alert if status changed or was already warning/urgent
        if (unit.status !== newStatus || newStatus === 'urgent') {
          const alertMessage = createAlertMessage(formData.name, numericVolume, newStatus);
          
          // Add a new alert to the alerts collection
          const alertsCollection = collection(db, "alerts");
          await addDoc(alertsCollection, {
            unit_id: unit.id,
            message: alertMessage,
            status: newStatus,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["units"] });
      await queryClient.invalidateQueries({ queryKey: ["alerts"] });
      
      toast({
        title: "Success",
        description: "Water unit has been updated successfully",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating unit:", error);
      toast({
        title: "Error",
        description: "Failed to update water unit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-spotify-darker border-spotify-accent">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Edit Water Unit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <UnitFormFields formData={formData} setFormData={setFormData} />
          <UnitFormActions onCancel={() => onOpenChange(false)} isSubmitting={isSubmitting} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
