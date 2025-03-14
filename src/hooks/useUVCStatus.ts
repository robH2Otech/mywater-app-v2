
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUVCStatus, createUVCAlertMessage } from "@/utils/uvcStatusUtils";
import { determineUnitStatus } from "@/utils/unitStatusUtils";

export function useUVCStatus(units: any[]) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processedUnits, setProcessedUnits] = useState<any[]>([]);

  useEffect(() => {
    const updatedUnits = units.map(unit => {
      // Ensure UVC hours is a number
      const uvcHours = typeof unit.uvc_hours === 'string' 
        ? parseFloat(unit.uvc_hours) 
        : (unit.uvc_hours || 0);
      
      // Ensure total_volume is a number
      let totalVolume = unit.total_volume;
      if (typeof totalVolume === 'string') {
        totalVolume = parseFloat(totalVolume);
      } else if (totalVolume === undefined || totalVolume === null) {
        totalVolume = 0;
      }
      
      // Calculate statuses
      const uvcStatus = determineUVCStatus(uvcHours);
      const filterStatus = determineUnitStatus(totalVolume);
      
      // Update if status changed
      if (unit.uvc_status !== uvcStatus) {
        updateUVCStatus(unit.id, uvcStatus, unit.name, uvcHours);
      }
      
      // Update if filter status changed
      if (unit.status !== filterStatus) {
        updateFilterStatus(unit.id, filterStatus, unit.name, totalVolume);
      }
      
      return {
        ...unit,
        uvc_status: uvcStatus,
        uvc_hours: uvcHours,
        status: filterStatus,
        total_volume: totalVolume
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
    processedUnits,
    updateUVCStatus 
  };
}
