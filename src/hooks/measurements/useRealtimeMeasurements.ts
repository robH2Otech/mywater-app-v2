
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { ProcessedMeasurement } from "./types/measurementTypes";
import { updateUnitTotalVolume } from "./useUnitVolume";
import { MEASUREMENT_PATHS } from "./utils/collectionPaths";
import { processMeasurementDocuments } from "./utils/dataProcessing";

export function useRealtimeMeasurements(unitId: string, count: number = 24) {
  const [measurements, setMeasurements] = useState<ProcessedMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  const refetch = async () => {
    if (!unitId) return;
    
    setIsLoading(true);
    setError(null);
    
    // Store all active subscriptions to clean up later
    const subscriptions: Array<() => void> = [];
    let foundData = false;
    
    // For MYWATER units, try specific paths first
    const isMyWaterUnit = unitId.startsWith("MYWATER_");
    const prioritizedPaths = [...MEASUREMENT_PATHS];
    
    if (isMyWaterUnit) {
      // Move these paths to the front for MYWATER units
      const myWaterPreferredPaths = [
        "units/{unitId}/data",
        "devices/{unitId}/data",
        "measurements/{unitId}/hourly"
      ];
      
      // Remove these paths from the array and add them to the front
      myWaterPreferredPaths.forEach(path => {
        const index = prioritizedPaths.indexOf(path);
        if (index !== -1) {
          prioritizedPaths.splice(index, 1);
        }
      });
      
      // Add the preferred paths to the front
      prioritizedPaths.unshift(...myWaterPreferredPaths);
      
      console.log(`🔍 MYWATER unit detected: ${unitId}. Prioritizing paths:`, myWaterPreferredPaths);
    }
    
    for (const pathTemplate of prioritizedPaths) {
      const collectionPath = pathTemplate.replace('{unitId}', unitId);
      
      try {
        console.log(`Setting up listener for ${unitId} at path: ${collectionPath}`);
        
        const measurementsQuery = query(
          collection(db, collectionPath),
          orderBy("timestamp", "desc"),
          limit(count)
        );
        
        // Set up realtime listener
        const unsubscribe = onSnapshot(
          measurementsQuery,
          (snapshot) => {
            if (!snapshot.empty) {
              console.log(`✅ Received data for ${unitId} from ${collectionPath}, count: ${snapshot.docs.length}`);
              foundData = true;
              
              try {
                const measurementsData = processMeasurementDocuments(snapshot.docs);
                setMeasurements(measurementsData);
                
                // Get the latest measurement for updating unit total volume
                if (measurementsData.length > 0) {
                  const latestMeasurement = measurementsData[0];
                  const latestVolume = typeof latestMeasurement.cumulative_volume === 'number'
                    ? latestMeasurement.cumulative_volume
                    : latestMeasurement.volume;
                  
                  updateUnitTotalVolume(unitId, latestVolume)
                    .then(() => {
                      // Invalidate relevant queries to refresh UI
                      queryClient.invalidateQueries({ queryKey: ['units'] });
                      queryClient.invalidateQueries({ queryKey: ['filter-units'] });
                      queryClient.invalidateQueries({ queryKey: ['unit', unitId] });
                      queryClient.invalidateQueries({ queryKey: ['uvc-units'] });
                      queryClient.invalidateQueries({ queryKey: ['reports'] });
                    })
                    .catch(err => console.error("Error updating unit volume:", err));
                }
              } catch (err) {
                console.error(`Error processing measurement data from ${collectionPath}:`, err);
                setError(err instanceof Error ? err : new Error(String(err)));
              }
              
              // If found data, cancel other listeners
              subscriptions.forEach(unsub => {
                if (unsub !== unsubscribe) {
                  unsub();
                }
              });
              
              setIsLoading(false);
            }
          },
          (err) => {
            console.error(`Error in realtime listener at ${collectionPath}:`, err);
            // Only set error if no other path has succeeded
            if (!foundData) {
              setError(err);
              setIsLoading(false);
            }
          }
        );
        
        subscriptions.push(unsubscribe);
      } catch (err) {
        console.warn(`Failed to set up listener at ${collectionPath}:`, err);
      }
    }
    
    // If we couldn't set up any listeners
    if (subscriptions.length === 0) {
      setError(new Error(`Could not find valid measurements collection for unit ${unitId}`));
      setIsLoading(false);
    }
    
    // Return a function to unsubscribe from all listeners
    return () => {
      subscriptions.forEach(unsubscribe => unsubscribe());
    };
  };

  useEffect(() => {
    if (!unitId) {
      setMeasurements([]);
      setIsLoading(false);
      return;
    }

    const cleanup = refetch();
    
    return () => {
      // Execute the cleanup function when component unmounts
      if (cleanup) {
        cleanup.then(unsubscribe => unsubscribe());
      }
    };
  }, [unitId, count]);

  return { measurements, isLoading, error, refetch };
}
