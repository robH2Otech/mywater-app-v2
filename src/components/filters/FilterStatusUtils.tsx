
import { doc, updateDoc, collection, addDoc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUnitStatus, createAlertMessage } from "@/utils/unitStatusUtils";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { recalculateCumulativeVolumes } from "@/utils/measurements/dataUtils";

export function useFilterStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateUnitStatus = async (unitId: string, newStatus: string, unitName: string, volume: number) => {
    try {
      // Update the unit document
      const unitDocRef = doc(db, "units", unitId);
      await updateDoc(unitDocRef, {
        status: newStatus,
        updated_at: new Date().toISOString()
      });

      // If status is warning or urgent, create an alert
      if (newStatus === 'warning' || newStatus === 'urgent') {
        const alertMessage = createAlertMessage(unitName, volume, newStatus);
        
        // Add a new alert to the alerts collection
        const alertsCollection = collection(db, "alerts");
        await addDoc(alertsCollection, {
          unit_id: unitId,
          message: alertMessage,
          status: newStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['filter-units'] });
      await queryClient.invalidateQueries({ queryKey: ['units'] });
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      
      toast({
        title: "Status updated",
        description: `${unitName} status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating unit status:', error);
    }
  };

  const processUnitsWithStatus = (units: any[]) => {
    return units.map(unit => {
      // Calculate status based on volume
      const calculatedStatus = determineUnitStatus(unit.total_volume);
      
      // If status needs updating, trigger update
      if (unit.status !== calculatedStatus) {
        updateUnitStatus(unit.id, calculatedStatus, unit.name, unit.total_volume);
      }
      
      return {
        ...unit,
        status: calculatedStatus // Show the correct status immediately in UI
      };
    });
  };

  const syncUnitMeasurements = async (unitId: string) => {
    try {
      // Recalculate all cumulative volumes for this unit
      const finalVolume = await recalculateCumulativeVolumes(unitId);
      
      // Get the unit details to update the status if needed
      const unitDocRef = doc(db, "units", unitId);
      const unitSnapshot = await getDoc(unitDocRef);
      
      if (unitSnapshot.exists()) {
        const unitData = unitSnapshot.data();
        const calculatedStatus = determineUnitStatus(finalVolume);
        
        // If status needs updating, update it
        if (unitData.status !== calculatedStatus) {
          await updateUnitStatus(unitId, calculatedStatus, unitData.name, finalVolume);
        }
        
        toast({
          title: "Measurements synced",
          description: `${unitData.name} measurements synchronized successfully.`,
        });
      }
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['filter-units'] });
      await queryClient.invalidateQueries({ queryKey: ['units'] });
      await queryClient.invalidateQueries({ queryKey: ['unit', unitId] });
      
      return finalVolume;
    } catch (error) {
      console.error('Error syncing unit measurements:', error);
      
      toast({
        title: "Sync failed",
        description: "Failed to synchronize unit measurements.",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  return { updateUnitStatus, processUnitsWithStatus, syncUnitMeasurements };
}
