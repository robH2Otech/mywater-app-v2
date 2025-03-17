
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { onSnapshot } from "firebase/firestore";
import { Measurement } from "@/utils/measurements/types";
import { 
  updateUnitTotalVolume
} from "./useUnitVolume";
import { 
  createMeasurementsQuery,
  processMeasurementDocuments
} from "./useMeasurementCollection";

export function useRealtimeMeasurements(unitId: string, count: number = 24) {
  const [measurements, setMeasurements] = useState<(Measurement & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!unitId) {
      setMeasurements([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    let unsubscribe: () => void;

    try {
      const measurementsQuery = createMeasurementsQuery(unitId, count);
      
      unsubscribe = onSnapshot(
        measurementsQuery,
        async (querySnapshot) => {
          try {
            // Process docs and ensure we get the most recent measurements (last 24 hours)
            // The query already sorts by timestamp desc and limits to count (24)
            const measurementsData = processMeasurementDocuments(
              querySnapshot.docs
            );
            
            setMeasurements(measurementsData);
            setIsLoading(false);
            
            // Update the unit's total_volume with the latest volume measurement
            if (measurementsData.length > 0) {
              // Get first item (most recent) to use for updates
              const latestMeasurement = measurementsData[0]; 
              const latestVolume = latestMeasurement.volume;
              
              console.log(`Latest measurement for unit ${unitId}: volume=${latestVolume}, UVC hours=${latestMeasurement.uvc_hours}`);
              
              // Update unit with latest volume
              await updateUnitTotalVolume(unitId, latestVolume);
              
              // Invalidate queries to refresh UI across the entire app
              queryClient.invalidateQueries({ queryKey: ['units'] });
              queryClient.invalidateQueries({ queryKey: ['filter-units'] });
              queryClient.invalidateQueries({ queryKey: ['unit', unitId] });
              queryClient.invalidateQueries({ queryKey: ['uvc-units'] });
              queryClient.invalidateQueries({ queryKey: ['reports'] });
            }
          } catch (err) {
            console.error("Error processing measurements data:", err);
            setError(err as Error);
            setIsLoading(false);
          }
        },
        (err) => {
          console.error(`Error listening to measurements:`, err);
          setError(err as Error);
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.error(`Failed to set up measurements listener:`, err);
      setError(err as Error);
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [unitId, count, queryClient]);

  return { measurements, isLoading, error };
}
