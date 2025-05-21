
import { useState, useEffect } from "react";
import { ProcessedMeasurement } from "./types/measurementTypes";
import { useMeasurementRefetch } from "./hooks/useMeasurementRefetch";

/**
 * Hook for fetching and listening to real-time measurement data
 * This is now a wrapper around the refactored hooks
 * @param unitId The ID of the unit to fetch measurements for
 * @param count The number of measurements to fetch (default: 24)
 */
export function useRealtimeMeasurements(unitId: string, count: number = 24) {
  const [measurements, setMeasurements] = useState<ProcessedMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pathSearching, setPathSearching] = useState(false);
  const { refetchMeasurements } = useMeasurementRefetch();

  // Refetch function that properly handles cleanup
  const refetch = async () => {
    return refetchMeasurements(
      unitId,
      count,
      setMeasurements,
      setIsLoading,
      setError,
      setPathSearching
    );
  };

  useEffect(() => {
    if (!unitId) {
      setMeasurements([]);
      setIsLoading(false);
      return;
    }

    console.log(`Setting up measurements for unit ${unitId}`);
    const unsubscribePromise = refetch();
    
    // Clean up function
    return () => {
      unsubscribePromise.then(cleanup => {
        if (cleanup) cleanup();
      });
    };
  }, [unitId, count]);

  return { 
    measurements, 
    isLoading, 
    error, 
    refetch, 
    pathSearching 
  };
}
