
import { useState, useCallback } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { ProcessedMeasurement } from "../types/measurementTypes";
import { processMeasurementDocuments } from "../utils/dataProcessing";
import { findMeasurementPath } from "../utils/measurementPathFinder";
import { useLatestMeasurement } from "./useLatestMeasurement";

/**
 * Hook providing a function to refetch measurements with proper cleanup
 */
export function useMeasurementRefetch() {
  const { processLatestMeasurement } = useLatestMeasurement();
  
  /**
   * Refetch measurements for a specific unit
   */
  const refetchMeasurements = useCallback(async (
    unitId: string,
    count: number,
    setMeasurements: (data: ProcessedMeasurement[]) => void,
    setIsLoading: (isLoading: boolean) => void,
    setError: (error: Error | null) => void,
    setPathSearching: (isSearching: boolean) => void
  ) => {
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
              
              // Process the latest measurement if available
              if (measurementsData.length > 0) {
                processLatestMeasurement(unitId, measurementsData).catch(err => 
                  console.error(`Error updating unit ${unitId} data:`, err)
                );
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
  }, [processLatestMeasurement]);

  return { refetchMeasurements };
}
