
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ProcessedMeasurement } from "../types/measurementTypes";
import { updateUnitTotalVolume } from "../useUnitVolume";

/**
 * Hook for processing latest measurement data and updating unit information
 */
export function useLatestMeasurement() {
  const queryClient = useQueryClient();
  
  const processLatestMeasurement = useCallback(async (
    unitId: string, 
    measurementsData: ProcessedMeasurement[]
  ) => {
    if (!measurementsData.length) return;
    
    try {
      const latestMeasurement = measurementsData[0];
      
      // Get the unit type to determine how to handle volume
      const unitType = unitId.startsWith("MYWATER_") ? 'uvc' : 'drop';
      
      // Determine which volume value to use
      let latestVolume = latestMeasurement.cumulative_volume ?? latestMeasurement.volume;
      
      // Update the unit's total volume in the database
      await updateUnitTotalVolume(unitId, latestVolume, unitType);
      
      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['unit', unitId] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      
      return latestMeasurement;
    } catch (err) {
      console.error(`Error processing latest measurement for unit ${unitId}:`, err);
      throw err;
    }
  }, [queryClient]);

  return { processLatestMeasurement };
}
