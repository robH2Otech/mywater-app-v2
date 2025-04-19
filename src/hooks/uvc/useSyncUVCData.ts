
import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc, getDoc } from "firebase/firestore";
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
      
      // Get the current unit data first
      const unitDocRef = doc(db, "units", unitId);
      const unitSnapshot = await getDoc(unitDocRef);
      
      if (!unitSnapshot.exists()) {
        console.log(`Unit ${unitId} not found for syncing`);
        return false;
      }
      
      const unitData = unitSnapshot.data();
      
      // Get the latest measurement data
      const measurementData = await fetchLatestMeasurement(unitId);
      
      if (!measurementData.hasMeasurementData || measurementData.latestMeasurementUvcHours <= 0) {
        console.log(`No valid measurement data found for unit ${unitId}`);
        return false;
      }
      
      // Always update with measurement data directly as it's the most current
      const measurementUvcHours = measurementData.latestMeasurementUvcHours;
      
      console.log(`Unit ${unitId}: Using measurement UVC hours=${measurementUvcHours} as the total`);
      
      // Update the unit document with latest hours and set flag
      await updateDoc(unitDocRef, {
        uvc_hours: measurementUvcHours,
        is_uvc_accumulated: true,
        last_sync_timestamp: new Date().toISOString()
      });
      
      console.log(`Successfully synchronized unit ${unitId} UVC data: ${measurementUvcHours} hours`);
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
      
      // Sync all units that have UVC functionality
      const unitsToSync = units.filter(unit => 
        unit.unit_type === 'uvc' || unit.uvc_hours !== undefined
      );
      
      console.log(`Found ${unitsToSync.length} units that need syncing`);
      
      if (unitsToSync.length === 0) {
        console.log("No units to sync");
        setLastSyncTime(new Date());
        setIsSyncing(false);
        return;
      }
      
      const syncResults = await Promise.all(
        unitsToSync.map(unit => syncUnitData(unit.id))
      );
      
      // Count successful syncs
      const successCount = syncResults.filter(Boolean).length;
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["uvc-units"] });
      await queryClient.invalidateQueries({ queryKey: ["units"] });
      await queryClient.invalidateQueries({ queryKey: ["measurements"] });
      
      // Record sync time
      setLastSyncTime(new Date());
      
      // Show success toast
      toast({
        title: "UVC Data Synchronized",
        description: `Successfully updated ${successCount} of ${unitsToSync.length} UVC units.`,
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
