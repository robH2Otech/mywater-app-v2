
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { determineUVCStatus, createUVCAlertMessage } from "@/utils/uvcStatusUtils";

export function useUVCStatusUpdate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateUVCStatus = async (unitId: string, uvcHours: number, installationDate?: string) => {
    try {
      // Determine the UVC status based on hours
      const newStatus = determineUVCStatus(uvcHours);
      
      // Update Firestore with the new data
      const unitDocRef = doc(db, "units", unitId);
      
      const updateData: any = {
        uvc_hours: uvcHours,
        uvc_status: newStatus,
        is_uvc_accumulated: true,
        updated_at: new Date().toISOString()
      };
      
      // Only add installation date if it's provided
      if (installationDate) {
        updateData.uvc_installation_date = installationDate;
      }
      
      await updateDoc(unitDocRef, updateData);
      
      // Create alert if status is warning or urgent
      if (newStatus === 'warning' || newStatus === 'urgent') {
        // Get the unit name first
        const unitSnapshot = await doc(db, "units", unitId).get();
        const unitName = unitSnapshot.data()?.name || "Unknown Unit";
        
        const alertMessage = createUVCAlertMessage(unitName, uvcHours, newStatus);
        
        const alertsCollection = collection(db, "alerts");
        await addDoc(alertsCollection, {
          unit_id: unitId,
          message: alertMessage,
          status: newStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      
      // Invalidate relevant queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['uvc-units'] });
      await queryClient.invalidateQueries({ queryKey: ['units'] });
      await queryClient.invalidateQueries({ queryKey: ['unit', unitId] });
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      
      toast({
        title: "Success",
        description: "UVC information has been updated successfully"
      });
      
      return true;
    } catch (error) {
      console.error('Error updating UVC status:', error);
      toast({
        title: "Error",
        description: "Failed to update UVC information",
        variant: "destructive"
      });
      return false;
    }
  };
  
  return { updateUVCStatus };
}
