
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { onSnapshot } from "firebase/firestore";
import { Measurement } from "@/utils/measurements/types";
import { 
  createMeasurementsQuery,
  processMeasurementDocuments
} from "./useMeasurementCollection";
import { calculate24HourVolume, updateUnitVolume } from "./useUnitVolume";

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
            const measurementsData = processMeasurementDocuments(querySnapshot.docs);
            
            // Sort by timestamp to ensure proper order (newest first)
            measurementsData.sort((a, b) => {
              return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });
            
            // Limit to exactly 24 data points (or less if not enough data)
            const limitedData = measurementsData.slice(0, count);
            
            // Calculate the total volume for the last 24 hours
            const volumeLast24Hours = calculate24HourVolume(limitedData);
            console.log(`Unit ${unitId} - Last 24h volume: ${volumeLast24Hours.toFixed(2)} m³`);
            
            // Update the unit document with the latest 24-hour volume
            if (limitedData.length > 0) {
              try {
                await updateUnitVolume(unitId, volumeLast24Hours);
              } catch (updateErr) {
                console.error(`Failed to update unit ${unitId} volume:`, updateErr);
              }
            }
            
            setMeasurements(limitedData);
            setIsLoading(false);
            
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
