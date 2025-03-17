
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { onSnapshot } from "firebase/firestore";
import { Measurement } from "@/utils/measurements/types";
import { 
  fetchUnitStartingVolume, 
  updateUnitVolume,
  fetchLast24HoursVolume
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
            const startingVolume = await fetchUnitStartingVolume(unitId);
            
            // Process docs to get measurements
            const measurementsData = processMeasurementDocuments(
              querySnapshot.docs,
              startingVolume
            );
            
            setMeasurements(measurementsData);
            setIsLoading(false);
            
            // Calculate the total 24h volume from measurements
            let total24hVolume = 0;
            measurementsData.forEach(measurement => {
              if (typeof measurement.volume === 'number') {
                total24hVolume += measurement.volume;
              }
            });
            
            // Update the unit's volume with the 24h total
            await updateUnitVolume(unitId, total24hVolume);
            
            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['units'] });
            queryClient.invalidateQueries({ queryKey: ['filter-units'] });
            queryClient.invalidateQueries({ queryKey: ['unit', unitId] });
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
