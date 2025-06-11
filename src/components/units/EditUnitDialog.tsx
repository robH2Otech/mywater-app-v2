
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AddUnitDialogContent } from "./AddUnitDialogContent";
import { useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUnitStatus, createAlertMessage } from "@/utils/unitStatusUtils";
import { determineUVCStatus, createUVCAlertMessage } from "@/utils/uvcStatusUtils";
import { formatDecimal } from "@/utils/measurements/formatUtils";

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
    setup_date?: string | null;
    uvc_hours?: number | string | null;
    uvc_status?: string | null;
    uvc_installation_date?: string | null;
    eid?: string | null;
    iccid?: string | null;
    unit_type?: string | null;
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
    total_volume: unit.total_volume ? formatDecimal(unit.total_volume) : "0.00",
    status: unit.status || "active",
    contact_name: unit.contact_name || "",
    contact_email: unit.contact_email || "",
    contact_phone: unit.contact_phone || "",
    next_maintenance: unit.next_maintenance ? new Date(unit.next_maintenance) : null,
    setup_date: unit.setup_date ? new Date(unit.setup_date) : null,
    uvc_hours: unit.uvc_hours ? formatDecimal(unit.uvc_hours) : "0.00",
    eid: unit.eid || "",
    iccid: unit.iccid || "",
    unit_type: unit.unit_type || "uvc",
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
      
      // Parse UVC hours if provided and unit is UVC type
      let uvcHours = null;
      let uvcStatus = unit.uvc_status;
      
      if (formData.unit_type === 'uvc' && formData.uvc_hours) {
        uvcHours = parseFloat(formData.uvc_hours);
        uvcStatus = determineUVCStatus(uvcHours);
      }
      
      // Prepare update data
      const updateData: any = {
        name: formData.name,
        location: formData.location || null,
        total_volume: numericVolume,
        status: newStatus,
        contact_name: formData.contact_name || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        next_maintenance: formData.next_maintenance?.toISOString() || null,
        setup_date: formData.setup_date?.toISOString() || null,
        updated_at: new Date().toISOString(),
        eid: formData.eid || null,
        iccid: formData.iccid || null,
        unit_type: formData.unit_type,
      };
      
      // Add UVC fields if hours are provided and unit is UVC type
      if (formData.unit_type === 'uvc' && uvcHours !== null) {
        updateData.uvc_hours = uvcHours;
        updateData.uvc_status = uvcStatus;
        if (!unit.uvc_installation_date) {
          updateData.uvc_installation_date = formData.setup_date?.toISOString() || null;
        }
      }
      
      // Update the unit document
      const unitDocRef = doc(db, "units", unit.id);
      await updateDoc(unitDocRef, updateData);

      // Check if the new status requires an alert
      if (newStatus === 'warning' || newStatus === 'urgent') {
        if (unit.status !== newStatus || newStatus === 'urgent') {
          const alertMessage = createAlertMessage(formData.name, numericVolume, newStatus);
          
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
      
      // Check if UVC status requires an alert (only for UVC units)
      if (formData.unit_type === 'uvc' && uvcHours !== null && uvcStatus && (uvcStatus === 'warning' || uvcStatus === 'urgent')) {
        if (unit.uvc_status !== uvcStatus || uvcStatus === 'urgent') {
          const uvcAlertMessage = createUVCAlertMessage(formData.name, uvcHours, uvcStatus);
          
          const alertsCollection = collection(db, "alerts");
          await addDoc(alertsCollection, {
            unit_id: unit.id,
            message: uvcAlertMessage,
            status: uvcStatus,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["units"] });
      await queryClient.invalidateQueries({ queryKey: ["uvc-units"] });
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
      <DialogContent className="sm:max-w-[600px] h-[90vh] bg-spotify-darker border-spotify-accent p-0 overflow-hidden">
        <AddUnitDialogContent
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          isEdit={true}
        />
      </DialogContent>
    </Dialog>
  );
}
