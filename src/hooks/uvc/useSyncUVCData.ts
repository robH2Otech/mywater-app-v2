
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
      console.log(`🔄 Syncing UVC data for unit ${unitId}`);
      
      // Get the current unit data first
      const unitDocRef = doc(db, "units", unitId);
      const unitSnapshot = await getDoc(unitDocRef);
      
      if (!unitSnapshot.exists()) {
        console.log(`❌ Unit ${unitId} not found for syncing`);
        return false;
      }
      
      const unitData = unitSnapshot.data();
      const isSpecialUnit = unitId.startsWith("MYWATER_") || unitId.startsWith("X-WATER");
      
      console.log(`📊 Unit ${unitId} current data - UVC Hours: ${unitData.uvc_hours}, Special: ${isSpecialUnit}, Accumulated: ${unitData.is_uvc_accumulated}`);
      
      // Get the latest measurement data
      const measurementData = await fetchLatestMeasurement(unitId);
      
      if (!measurementData.hasMeasurementData || measurementData.latestMeasurementUvcHours <= 0) {
        console.log(`⚠️ No valid measurement data found for unit ${unitId}`);
        return false;
      }
      
      const measurementUvcHours = measurementData.latestMeasurementUvcHours;
      let finalUvcHours = measurementUvcHours;
      
      // For special units or units showing 0 hours, use measurement data directly
      if (isSpecialUnit || !unitData.uvc_hours || unitData.uvc_hours === 0) {
        finalUvcHours = measurementUvcHours;
        console.log(`✅ Unit ${unitId}: Using measurement UVC hours directly=${finalUvcHours}`);
      } 
      // For other units, check if we should accumulate or replace
      else if (!unitData.is_uvc_accumulated) {
        // Add to existing base hours
        const baseHours = parseFloat(unitData.uvc_hours) || 0;
        finalUvcHours = baseHours + measurementUvcHours;
        console.log(`📈 Unit ${unitId}: Accumulating ${baseHours} + ${measurementUvcHours} = ${finalUvcHours}`);
      } else {
        // Use existing accumulated hours if they're greater than measurement
        const existingHours = parseFloat(unitData.uvc_hours) || 0;
        finalUvcHours = Math.max(existingHours, measurementUvcHours);
        console.log(`📊 Unit ${unitId}: Using max of existing (${existingHours}) and measurement (${measurementUvcHours}) = ${finalUvcHours}`);
      }
      
      // Only update if there's a meaningful change
      const currentUvcHours = parseFloat(unitData.uvc_hours) || 0;
      if (Math.abs(finalUvcHours - currentUvcHours) < 0.1) {
        console.log(`📊 Unit ${unitId}: No significant change needed (${finalUvcHours} vs ${currentUvcHours})`);
        return true;
      }
      
      // Update the unit document with latest hours and set flag
      await updateDoc(unitDocRef, {
        uvc_hours: finalUvcHours,
        is_uvc_accumulated: true,
        last_sync_timestamp: new Date().toISOString()
      });
      
      console.log(`✅ Successfully synchronized unit ${unitId} UVC data: ${currentUvcHours} → ${finalUvcHours} hours`);
      return true;
    } catch (error) {
      console.error(`❌ Error syncing UVC data for unit ${unitId}:`, error);
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
      console.log(`🔄 Syncing ${units.length} UVC units...`);
      
      // Filter units that need syncing (UVC units or units with measurement potential)
      const unitsToSync = units.filter(unit => {
        const isUVCType = unit.unit_type === 'uvc';
        const isSpecialUnit = unit.id?.startsWith("MYWATER_") || unit.id?.startsWith("X-WATER");
        const hasUVCData = unit.uvc_hours !== undefined;
        const needsSync = unit.uvc_hours === 0 || unit.uvc_hours === null || !unit.is_uvc_accumulated;
        
        return (isUVCType || isSpecialUnit || hasUVCData) && needsSync;
      });
      
      console.log(`🎯 Found ${unitsToSync.length} units that need syncing:`, unitsToSync.map(u => `${u.id}(${u.uvc_hours}h)`));
      
      if (unitsToSync.length === 0) {
        console.log("✅ No units need syncing");
        setLastSyncTime(new Date());
        setIsSyncing(false);
        return;
      }
      
      // Sync units in parallel with small batches to avoid overwhelming Firestore
      const batchSize = 3;
      let successCount = 0;
      
      for (let i = 0; i < unitsToSync.length; i += batchSize) {
        const batch = unitsToSync.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(unit => syncUnitData(unit.id))
        );
        successCount += batchResults.filter(Boolean).length;
        
        // Small delay between batches
        if (i + batchSize < unitsToSync.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
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
      
      console.log(`✅ Sync completed: ${successCount}/${unitsToSync.length} units updated`);
    } catch (error) {
      console.error("❌ Error synchronizing UVC data:", error);
      
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
