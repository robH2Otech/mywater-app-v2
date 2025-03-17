
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { onSnapshot } from "firebase/firestore";
import { Measurement } from "@/utils/measurements/types";
import { updateUnitTotalVolume } from "./useUnitVolume";
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
            // Process documents to get the most recent measurements (limited to count/24)
            // The query already limits and sorts by timestamp desc
            const measurementsData = processMeasurementDocuments(querySnapshot.docs);
            
            setMeasurements(measurementsData);
            setIsLoading(false);
            
            // Update the unit's total_volume with the latest total volume
            if (measurementsData.length > 0) {
              // Calculate total volume for the last 24 hours
              const totalVolume = measurementsData.reduce((sum, measurement) => {
                return sum + (typeof measurement.volume === 'number' ? measurement.volume : 0);
              }, 0);
              
              await updateUnitTotalVolume(unitId, totalVolume);
              
              // Invalidate queries to refresh UI
              queryClient.invalidateQueries({ queryKey: ['units'] });
              queryClient.invalidateQueries({ queryKey: ['filter-units'] });
              queryClient.invalidateQueries({ queryKey: ['unit', unitId] });
              queryClient.invalidateQueries({ queryKey: ['dashboard-units'] });
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
