
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { ProcessedMeasurement } from "../types/measurementTypes";
import { updateUnitTotalVolume } from "../useUnitVolume";
import { processMeasurementDocuments } from "../utils/dataProcessing";
import { findMeasurementPath } from "../utils/measurementPathFinder";

/**
 * Hook for fetching and listening to real-time measurement data
 * @param unitId The ID of the unit to fetch measurements for
 * @param count The number of measurements to fetch (default: 24)
 */
export function useRealtimeMeasurements(unitId: string, count: number = 24) {
  const [measurements, setMeasurements] = useState<ProcessedMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pathSearching, setPathSearching] = useState(false);
  const queryClient = useQueryClient();

  // Refetch function that properly handles cleanup
  const refetch = async () => {
    if (!unitId) return () => {};
    
    console.log(`Refetching measurements for unit ${unitId}`);
    setIsLoading(true);
    setError(null);
    setPathSearching(true);
    
    // A single unsubscribe function that can be returned
    let unsubscribeFunc: (() => void) | null = null;

    try {
      // Try to find the correct path
      const measurementPath = await findMeasurementPath(unitId);
      
      setPathSearching(false);
      
      if (!measurementPath) {
        setError(new Error(`Could not find a valid data path for unit ${unitId}`));
        setIsLoading(false);
        return () => {};
      }
      
      console.log(`Setting up realtime listener for unit ${unitId} at path: ${measurementPath}`);
      
      // Set up the realtime listener
      const measurementsQuery = query(
        collection(db, measurementPath),
        orderBy("timestamp", "desc"),
        limit(count)
      );
      
      // Create and store the unsubscribe function
      unsubscribeFunc = onSnapshot(
        measurementsQuery,
        (snapshot) => {
          if (snapshot.empty) {
            console.log(`No data at path ${measurementPath} for unit ${unitId}`);
            setMeasurements([]);
          } else {
            console.log(`Received data for unit ${unitId} from ${measurementPath}, count: ${snapshot.docs.length}`);
            
            try {
              const measurementsData = processMeasurementDocuments(snapshot.docs);
              setMeasurements(measurementsData);
              
              // Process the latest measurement for updating unit state if needed
              if (measurementsData.length > 0) {
                const latestMeasurement = measurementsData[0];
                
                // Get the unit type to determine how to handle volume
                const unitType = unitId.startsWith("MYWATER_") ? 'uvc' : 'drop';
                
                // Determine which volume value to use
                let latestVolume = latestMeasurement.cumulative_volume ?? latestMeasurement.volume;
                
                // Update the unit's total volume in the database
                updateUnitTotalVolume(unitId, latestVolume, unitType)
                  .then(() => {
                    // Invalidate relevant queries to refresh UI
                    queryClient.invalidateQueries({ queryKey: ['unit', unitId] });
                    queryClient.invalidateQueries({ queryKey: ['units'] });
                  })
                  .catch(err => console.error(`Error updating unit ${unitId} volume:`, err));
              }
            } catch (err) {
              console.error(`Error processing measurements for unit ${unitId}:`, err);
              setError(err instanceof Error ? err : new Error(String(err)));
            }
          }
          
          setIsLoading(false);
        },
        (err) => {
          console.error(`Error in listener for unit ${unitId}:`, err);
          setError(err);
          setIsLoading(false);
        }
      );
      
    } catch (err) {
      console.error(`Error setting up measurements for unit ${unitId}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      setPathSearching(false);
    }
    
    // Return a function that calls the stored unsubscribe function
    return () => {
      if (unsubscribeFunc) {
        console.log(`Cleaning up listener for unit ${unitId}`);
        unsubscribeFunc();
      }
    };
  };

  useEffect(() => {
    if (!unitId) {
      setMeasurements([]);
      setIsLoading(false);
      return;
    }

    console.log(`Setting up measurements for unit ${unitId}`);
    const unsubscribe = refetch();
    
    // Clean up function
    return () => {
      unsubscribe.then(cleanup => {
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
