
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUVCStatus, createUVCAlertMessage } from "@/utils/uvcStatusUtils";

export function useUVCStatus(units: any[]) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processedUnits, setProcessedUnits] = useState<any[]>([]);

  useEffect(() => {
    const updatedUnits = units.map(unit => {
      const uvcHours = unit.uvc_hours || 0;
      const calculatedStatus = determineUVCStatus(uvcHours);
      
      if (unit.uvc_status !== calculatedStatus) {
        updateUVCStatus(unit.id, calculatedStatus, unit.name, uvcHours);
      }
      
      return {
        ...unit,
        uvc_status: calculatedStatus
      };
    });
    
    setProcessedUnits(updatedUnits);
  }, [units]);

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
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      
      toast({
        title: "Status updated",
        description: `${unitName} UVC status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating UVC status:', error);
    }
  };

  return { 
    processedUnits,
    updateUVCStatus 
  };
}
