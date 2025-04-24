
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { ProcessedMeasurement } from "./types/measurementTypes";
import { updateUnitTotalVolume } from "./useUnitVolume";
import { MEASUREMENT_PATHS } from "./utils/collectionPaths";
import { setupRealtimeListener } from "./useRealtimeUpdates";

export function useRealtimeMeasurements(unitId: string, count: number = 24) {
  const [measurements, setMeasurements] = useState<ProcessedMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  const refetch = async () => {
    if (!unitId) return;
    
    setIsLoading(true);
    setError(null);
    
    for (const pathTemplate of MEASUREMENT_PATHS) {
      const collectionPath = pathTemplate.replace('{unitId}', unitId);
      
      try {
        const measurementsQuery = query(
          collection(db, collectionPath),
          orderBy("timestamp", "desc"),
          limit(count)
        );
        
        const unsubscribe = setupRealtimeListener(
          measurementsQuery,
          async (measurementsData) => {
            if (measurementsData.length > 0) {
              setMeasurements(measurementsData);
              
              const latestMeasurement = measurementsData[0];
              const latestVolume = typeof latestMeasurement.cumulative_volume === 'number'
                ? latestMeasurement.cumulative_volume
                : latestMeasurement.volume;
              
              await updateUnitTotalVolume(unitId, latestVolume);
              
              queryClient.invalidateQueries({ queryKey: ['units'] });
              queryClient.invalidateQueries({ queryKey: ['filter-units'] });
              queryClient.invalidateQueries({ queryKey: ['unit', unitId] });
              queryClient.invalidateQueries({ queryKey: ['uvc-units'] });
              queryClient.invalidateQueries({ queryKey: ['reports'] });
            }
            setIsLoading(false);
          },
          (err) => {
            console.error(`Error in realtime listener at ${collectionPath}:`, err);
            setError(err);
            setIsLoading(false);
          }
        );
        
        return unsubscribe;
      } catch (err) {
        console.warn(`Failed to set up listener at ${collectionPath}:`, err);
      }
    }
    
    setIsLoading(false);
    return () => {};
  };

  useEffect(() => {
    if (!unitId) {
      setMeasurements([]);
      setIsLoading(false);
      return;
    }

    const cleanup = refetch();
    
    return () => {
      cleanup.then(unsubscribe => unsubscribe());
    };
  }, [unitId, count, queryClient]);

  return { measurements, isLoading, error, refetch };
}
