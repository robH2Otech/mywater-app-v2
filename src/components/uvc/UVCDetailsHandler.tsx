
import { useState } from "react";
import { UVCDetailsDialog } from "@/components/uvc/UVCDetailsDialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUVCStatus, createUVCAlertMessage } from "@/utils/uvcStatusUtils";
import { UnitWithUVC } from "@/hooks/uvc/useUVCData";
import { useUVCStatusMutation } from "@/hooks/uvc/useUVCStatusMutation";

interface UVCDetailsHandlerProps {
  selectedUnit: UnitWithUVC | null;
  onClose: () => void;
}

export function UVCDetailsHandler({ selectedUnit, onClose }: UVCDetailsHandlerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const uvcMutation = useUVCStatusMutation();

  const handleSaveUVCDetails = async (updatedData: any) => {
    if (!selectedUnit) return;
    
    try {
      setIsSaving(true);
      
      // Convert hours to numeric value
      const numericHours = typeof updatedData.uvc_hours === 'string' ? 
        parseFloat(updatedData.uvc_hours) : updatedData.uvc_hours;
      
      // Submit the mutation
      await uvcMutation.mutateAsync({
        unitId: selectedUnit.id,
        uvcHours: numericHours,
        unitName: selectedUnit.name || '',
        installationDate: updatedData.uvc_installation_date
      });
      
      // Close dialog
      onClose();
    } catch (error) {
      console.error("Error in handleSaveUVCDetails:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <UVCDetailsDialog
      open={!!selectedUnit}
      onOpenChange={(open) => !open && onClose()}
      unit={selectedUnit}
      onSave={handleSaveUVCDetails}
      isSaving={isSaving}
    />
  );
}
