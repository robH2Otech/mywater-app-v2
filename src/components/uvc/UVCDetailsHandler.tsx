
import { useState } from "react";
import { UVCDetailsDialog } from "@/components/uvc/UVCDetailsDialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUVCStatus, createUVCAlertMessage } from "@/utils/uvcStatusUtils";
import { UnitWithUVC } from "@/hooks/uvc/useUVCData";

interface UVCDetailsHandlerProps {
  selectedUnit: UnitWithUVC | null;
  onClose: () => void;
}

export function UVCDetailsHandler({ selectedUnit, onClose }: UVCDetailsHandlerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSaveUVCDetails = async (updatedData: any) => {
    if (!selectedUnit) return;
    
    try {
      // Convert hours to numeric value and determine new status
      const numericHours = typeof updatedData.uvc_hours === 'string' ? 
        parseFloat(updatedData.uvc_hours) : updatedData.uvc_hours;
      
      console.log(`Saving UVC hours for ${selectedUnit.id}: ${numericHours}`);
      
      const newStatus = determineUVCStatus(numericHours);
      const oldStatus = selectedUnit.uvc_status;
      
      // Prepare data for Firestore update
      const updateData: any = {
        uvc_hours: numericHours,
        uvc_status: newStatus,
        // Mark this unit as having manually accumulated UVC hours
        is_uvc_accumulated: true,
        updated_at: new Date().toISOString()
      };
      
      // Add installation date if provided
      if (updatedData.uvc_installation_date) {
        updateData.uvc_installation_date = updatedData.uvc_installation_date.toISOString();
      }
      
      console.log("Updating unit with data:", updateData);
      
      // Update the unit document in Firestore
      const unitDocRef = doc(db, "units", selectedUnit.id);
      await updateDoc(unitDocRef, updateData);
      
      // Create alert if status changed to warning or urgent
      if ((newStatus === 'warning' || newStatus === 'urgent') && newStatus !== oldStatus) {
        const alertMessage = createUVCAlertMessage(selectedUnit.name || '', numericHours, newStatus);
        
        // Create new alert
        const alertsCollection = collection(db, "alerts");
        await addDoc(alertsCollection, {
          unit_id: selectedUnit.id,
          message: alertMessage,
          status: newStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["uvc-units"] });
      await queryClient.invalidateQueries({ queryKey: ["units"] });
      await queryClient.invalidateQueries({ queryKey: ["unit", selectedUnit.id] });
      await queryClient.invalidateQueries({ queryKey: ["alerts"] });
      
      toast({
        title: "UVC details updated",
        description: `Updated UVC details for ${selectedUnit.name}`,
      });
      
      // Close dialog
      onClose();
    } catch (error) {
      console.error("Error updating UVC details:", error);
      toast({
        title: "Error updating UVC details",
        description: "Failed to update UVC details",
        variant: "destructive",
      });
    }
  };

  return (
    <UVCDetailsDialog
      open={!!selectedUnit}
      onOpenChange={(open) => !open && onClose()}
      unit={selectedUnit}
      onSave={handleSaveUVCDetails}
    />
  );
}
