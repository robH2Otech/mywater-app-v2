
import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { fetchLatestMeasurement } from "./measurementUtils";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to synchronize UVC unit data with the latest measurements
 */
export function useSyncUVCData() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Function to sync a single unit
  const syncUnitData = useCallback(async (unitId: string) => {
    try {
      console.log(`Syncing UVC data for unit ${unitId}`);
      
      // Fetch the latest measurement data
      const measurementData = await fetchLatestMeasurement(unitId);
      
      if (!measurementData.hasMeasurementData) {
        console.log(`No measurement data found for unit ${unitId}`);
        return false;
      }
      
      // Update the unit document with accumulated hours
      const unitDocRef = doc(db, "units", unitId);
      await updateDoc(unitDocRef, {
        uvc_hours: measurementData.latestMeasurementUvcHours,
        is_uvc_accumulated: true,
        last_sync_timestamp: new Date().toISOString()
      });
      
      console.log(`Successfully synchronized unit ${unitId} UVC data`);
      return true;
    } catch (error) {
      console.error(`Error syncing UVC data for unit ${unitId}:`, error);
      return false;
    }
  }, []);

  // Function to sync all UVC units
  const syncAllUnits = useCallback(async (units: any[]) => {
    if (!units || units.length === 0 || isSyncing) {
      return;
    }
    
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      console.log(`Syncing ${units.length} UVC units...`);
      
      const syncResults = await Promise.all(
        units.map(unit => syncUnitData(unit.id))
      );
      
      // Count successful syncs
      const successCount = syncResults.filter(Boolean).length;
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["uvc-units"] });
      await queryClient.invalidateQueries({ queryKey: ["units"] });
      
      // Record sync time
      setLastSyncTime(new Date());
      
      // Show success toast
      toast({
        title: "UVC Data Synchronized",
        description: `Successfully updated ${successCount} of ${units.length} UVC units.`,
      });
    } catch (error) {
      console.error("Error synchronizing UVC data:", error);
      
      setSyncError("Failed to synchronize UVC data");
      
      // Show error toast
      toast({
        title: "Sync Failed",
        description: "Could not synchronize UVC data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, syncUnitData, queryClient, toast]);

  return {
    syncAllUnits,
    syncUnitData,
    isSyncing,
    syncError,
    lastSyncTime
  };
}
