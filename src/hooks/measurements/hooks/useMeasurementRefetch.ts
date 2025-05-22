
import { useState, useCallback } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { ProcessedMeasurement } from "../types/measurementTypes";
import { processMeasurementDocuments } from "../utils/dataProcessing";
import { findMeasurementPath } from "../utils/measurementPathFinder";

/**
 * Hook that handles refetching of measurement data
 */
export function useMeasurementRefetch() {
  const [isRefetching, setIsRefetching] = useState(false);
  
  const refetchMeasurements = useCallback(async (
    unitId: string,
    count: number,
    setMeasurements: (data: ProcessedMeasurement[]) => void,
    setIsLoading: (loading: boolean) => void,
    setError: (error: Error | null) => void,
    setPathSearching?: (searching: boolean) => void
  ) => {
    if (!unitId) {
      console.error("Cannot refetch measurements: Unit ID is missing");
      setError(new Error("Unit ID is required"));
      return () => {};
    }
    
    console.log(`Refetching measurements for unit ${unitId}`);
    setIsRefetching(true);
    setIsLoading(true);
    setError(null);
    
    if (setPathSearching) {
      setPathSearching(true);
    }
    
    // A single unsubscribe function that can be returned
    let unsubscribeFunc: (() => void) | null = null;

    try {
      // Try to find the correct path with priority for MYWATER units
      const isMyWaterUnit = unitId.startsWith("MYWATER_");
      let measurementPath: string | null = null;
      
      if (isMyWaterUnit) {
        // For MYWATER units, directly use the primary path
        measurementPath = `units/${unitId}/data`;
        console.log(`Using primary path for MYWATER unit ${unitId}: ${measurementPath}`);
      } else {
        // For other units, find the best path
        measurementPath = await findMeasurementPath(unitId);
      }
      
      if (setPathSearching) {
        setPathSearching(false);
      }
      
      if (!measurementPath) {
        console.error(`Could not find a valid data path for unit ${unitId}`);
        setError(new Error(`Could not find a valid data path for unit ${unitId}`));
        setIsLoading(false);
        setIsRefetching(false);
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
            } catch (err) {
              console.error(`Error processing measurements for unit ${unitId}:`, err);
              setError(err instanceof Error ? err : new Error(String(err)));
            }
          }
          
          setIsLoading(false);
          setIsRefetching(false);
        },
        (err) => {
          console.error(`Error in listener for unit ${unitId}:`, err);
          setError(err);
          setIsLoading(false);
          setIsRefetching(false);
        }
      );
      
    } catch (err) {
      console.error(`Error setting up measurements for unit ${unitId}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      setIsRefetching(false);
      
      if (setPathSearching) {
        setPathSearching(false);
      }
    }
    
    // Return a function that calls the stored unsubscribe function
    return () => {
      if (unsubscribeFunc) {
        console.log(`Cleaning up listener for unit ${unitId}`);
        unsubscribeFunc();
      }
    };
  }, []);

  return { refetchMeasurements, isRefetching };
}
