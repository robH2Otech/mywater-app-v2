
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { determineUVCStatus, createUVCAlertMessage } from "@/utils/uvcStatusUtils";

/**
 * Hook providing functions to update UVC status in Firestore
 */
export function useUVCStatusUpdate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateUVCStatus = async (unitId: string, newStatus: string, unitName: string, hours: number) => {
    try {
      const unitDocRef = doc(db, "units", unitId);
      await updateDoc(unitDocRef, {
        uvc_status: newStatus,
        updated_at: new Date().toISOString()
      });

      if (newStatus === 'warning' || newStatus === 'urgent') {
        const alertMessage = createUVCAlertMessage(unitName, hours, newStatus);
        
        const alertsCollection = collection(db, "alerts");
        await addDoc(alertsCollection, {
          unit_id: unitId,
          message: alertMessage,
          status: newStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['uvc-units'] });
      await queryClient.invalidateQueries({ queryKey: ['units'] });
      await queryClient.invalidateQueries({ queryKey: ['unit', unitId] });
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      
      toast({
        title: "Status updated",
        description: `${unitName} UVC status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating UVC status:', error);
    }
  };

  const updateFilterStatus = async (unitId: string, newStatus: string, unitName: string, volume: number) => {
    try {
      const unitDocRef = doc(db, "units", unitId);
      await updateDoc(unitDocRef, {
        status: newStatus,
        updated_at: new Date().toISOString()
      });

      if (newStatus === 'warning' || newStatus === 'urgent') {
        const { createAlertMessage } = await import('@/utils/unitStatusUtils');
        const alertMessage = createAlertMessage(unitName, volume, newStatus);
        
        const alertsCollection = collection(db, "alerts");
        await addDoc(alertsCollection, {
          unit_id: unitId,
          message: alertMessage,
          status: newStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['filter-units'] });
      await queryClient.invalidateQueries({ queryKey: ['units'] });
      await queryClient.invalidateQueries({ queryKey: ['unit', unitId] });
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      
      toast({
        title: "Status updated",
        description: `${unitName} filter status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating filter status:', error);
    }
  };

  return {
    updateUVCStatus,
    updateFilterStatus
  };
}
