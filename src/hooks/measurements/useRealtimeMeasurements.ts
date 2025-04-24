import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { onSnapshot, getDocs, collection, query, orderBy, limit } from "firebase/firestore";
import { ProcessedMeasurement } from "@/utils/measurements/types";
import { 
  updateUnitTotalVolume
} from "./useUnitVolume";
import { 
  createMeasurementsQuery,
  processMeasurementDocuments
} from "./useMeasurementCollection";
import { db } from "@/integrations/firebase/client";

const MEASUREMENT_PATHS = [
  "units/{unitId}/measurements",
  "units/{unitId}/data",
  "measurements/{unitId}/data",
  "device-data/{unitId}/measurements"
];

export function useRealtimeMeasurements(unitId: string, count: number = 24) {
  const [measurements, setMeasurements] = useState<ProcessedMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  const refetch = async () => {
    if (!unitId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let foundData = false;
      let measurementsData: ProcessedMeasurement[] = [];
      
      for (const pathTemplate of MEASUREMENT_PATHS) {
        const collectionPath = pathTemplate.replace('{unitId}', unitId);
        console.log(`Refetch: Trying collection path: ${collectionPath} for unit ${unitId}`);
        
        try {
          const measurementsQuery = query(
            collection(db, collectionPath),
            orderBy("timestamp", "desc"),
            limit(count)
          );
          
          const querySnapshot = await getDocs(measurementsQuery);
          
          if (!querySnapshot.empty) {
            measurementsData = processMeasurementDocuments(querySnapshot.docs);
            
            console.log(`Refetch: Found ${measurementsData.length} measurements for unit ${unitId} in path ${collectionPath}`);
            
            if (measurementsData.length > 0) {
              foundData = true;
              
              measurementsData = measurementsData.map(m => ({
                ...m,
                unitId: m.unitId || unitId
              }));
              
              setMeasurements(measurementsData);
              
              const latestMeasurement = measurementsData[0];
              
              const latestCumulativeVolume = typeof latestMeasurement.cumulative_volume === 'number'
                ? latestMeasurement.cumulative_volume
                : latestMeasurement.volume;
              
              await updateUnitTotalVolume(unitId, latestCumulativeVolume);
              
              queryClient.invalidateQueries({ queryKey: ['units'] });
              queryClient.invalidateQueries({ queryKey: ['filter-units'] });
              queryClient.invalidateQueries({ queryKey: ['unit', unitId] });
              queryClient.invalidateQueries({ queryKey: ['uvc-units'] });
              queryClient.invalidateQueries({ queryKey: ['reports'] });
              
              break;
            }
          }
        } catch (err) {
          console.warn(`Refetch: Error trying path ${collectionPath} for unit ${unitId}:`, err);
        }
      }
      
      if (!foundData) {
        console.log(`Refetch: No measurement data found for unit ${unitId} after trying all paths`);
        if (measurements.length === 0) {
          setMeasurements([]);
        }
      }
    } catch (err) {
      console.error("Error refetching measurements data:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
    
    return measurements;
  };

  useEffect(() => {
    if (!unitId) {
      setMeasurements([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    let unsubscribe: () => void;
    let isSubscribed = true;

    const setupSubscription = async () => {
      try {
        for (const pathTemplate of MEASUREMENT_PATHS) {
          const collectionPath = pathTemplate.replace('{unitId}', unitId);
          console.log(`Setting up subscription for path: ${collectionPath} for unit ${unitId}`);
          
          try {
            const measurementsQuery = query(
              collection(db, collectionPath),
              orderBy("timestamp", "desc"),
              limit(count)
            );
            
            unsubscribe = onSnapshot(
              measurementsQuery,
              async (querySnapshot) => {
                if (!isSubscribed) return;
                
                try {
                  const measurementsData = processMeasurementDocuments(
                    querySnapshot.docs
                  );
                  
                  console.log(`Received ${measurementsData.length} measurements for unit ${unitId} from path ${collectionPath}`);
                  
                  const enrichedMeasurements = measurementsData.map(m => ({
                    ...m,
                    unitId: m.unitId || unitId
                  }));
                  
                  setMeasurements(enrichedMeasurements);
                  setIsLoading(false);
                  
                  if (enrichedMeasurements.length > 0) {
                    const latestMeasurement = enrichedMeasurements[0]; 
                    
                    const latestCumulativeVolume = typeof latestMeasurement.cumulative_volume === 'number'
                      ? latestMeasurement.cumulative_volume
                      : latestMeasurement.volume;
                    
                    console.log(`Latest measurement for unit ${unitId}: cumulative volume=${latestCumulativeVolume}, UVC hours=${latestMeasurement.uvc_hours}`);
                    
                    await updateUnitTotalVolume(unitId, latestCumulativeVolume);
                    
                    queryClient.invalidateQueries({ queryKey: ['units'] });
                    queryClient.invalidateQueries({ queryKey: ['filter-units'] });
                    queryClient.invalidateQueries({ queryKey: ['unit', unitId] });
                    queryClient.invalidateQueries({ queryKey: ['uvc-units'] });
                    queryClient.invalidateQueries({ queryKey: ['reports'] });
                  }
                } catch (err) {
                  if (!isSubscribed) return;
                  console.error("Error processing measurements data:", err);
                  setError(err as Error);
                  setIsLoading(false);
                }
              },
              (err) => {
                if (!isSubscribed) return;
                console.error(`Error listening to measurements at ${collectionPath}:`, err);
              }
            );
            
            const testSnapshot = await getDocs(measurementsQuery);
            
            if (!testSnapshot.empty) {
              console.log(`Subscription set up successfully for ${unitId} at ${collectionPath} with ${testSnapshot.size} measurements`);
              return true;
            } else {
              console.log(`Path ${collectionPath} exists but has no data for ${unitId}`);
              unsubscribe();
            }
          } catch (err) {
            console.warn(`Failed to set up listener at ${collectionPath} for ${unitId}:`, err);
          }
        }
        
        console.log(`Couldn't find a working data path for unit ${unitId}, will use manual fetching`);
        
        await refetch();
        
        const intervalId = setInterval(() => {
          if (isSubscribed) {
            refetch();
          }
        }, 30000);
        
        return () => {
          clearInterval(intervalId);
        };
      } catch (err) {
        if (!isSubscribed) return;
        console.error(`Failed to set up any measurement listener for ${unitId}:`, err);
        setError(err as Error);
        setIsLoading(false);
      }
      
      return false;
    };
    
    setupSubscription();

    return () => {
      isSubscribed = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [unitId, count, queryClient]);

  return { measurements, isLoading, error, refetch };
}
