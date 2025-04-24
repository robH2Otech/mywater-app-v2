
import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { ProcessedMeasurement } from "@/utils/measurements/types";

/**
 * Gets the Firestore collection path for measurements of a specific unit
 */
export function getMeasurementsCollectionPath(unitId: string): string {
  return `units/${unitId}/measurements`;
}

/**
 * Creates a Firestore query for fetching measurements
 */
export function createMeasurementsQuery(unitId: string, count: number = 24) {
  const collectionPath = getMeasurementsCollectionPath(unitId);
  return query(
    collection(db, collectionPath),
    orderBy("timestamp", "desc"),
    limit(count)
  );
}

/**
 * Processes measurement document snapshots into a standardized format
 */
export function processMeasurementDocuments(
  docs: QueryDocumentSnapshot[]
): ProcessedMeasurement[] {
  return docs.map((doc) => {
    const data = doc.data();
    
    // Create a processed measurement with the document ID
    const processedMeasurement: ProcessedMeasurement = {
      id: doc.id,
      timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp,
      rawTimestamp: data.timestamp, // Store the raw timestamp for formatting
      volume: 0,
      temperature: 0,
    };
    
    // Process numeric values with proper formatting
    if (data.volume !== undefined) {
      processedMeasurement.volume = typeof data.volume === 'number' 
        ? data.volume
        : parseFloat(data.volume || '0');
    }
    
    if (data.temperature !== undefined) {
      processedMeasurement.temperature = typeof data.temperature === 'number'
        ? data.temperature
        : parseFloat(data.temperature || '0');
    }
    
    if (data.cumulative_volume !== undefined) {
      processedMeasurement.cumulative_volume = typeof data.cumulative_volume === 'number'
        ? data.cumulative_volume
        : parseFloat(data.cumulative_volume || '0');
    }
    
    if (data.uvc_hours !== undefined) {
      processedMeasurement.uvc_hours = typeof data.uvc_hours === 'number'
        ? data.uvc_hours
        : parseFloat(data.uvc_hours || '0');
    }
    
    return processedMeasurement;
  });
}

/**
 * Hook to fetch and subscribe to measurements for one or more units
 */
export function useMeasurementCollection(unitId?: string | string[]) {
  const [measurements, setMeasurements] = useState<ProcessedMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state when unitId changes
    setIsLoading(true);
    setError(null);
    
    if (!unitId) {
      setMeasurements([]);
      setIsLoading(false);
      return;
    }

    // Handle single unit ID or array of unit IDs
    const unitIds = Array.isArray(unitId) ? unitId : [unitId];
    
    if (unitIds.length === 0) {
      setMeasurements([]);
      setIsLoading(false);
      return;
    }

    // Create a separate query for each unit and subscribe to them
    const unsubscribes = unitIds.map(id => {
      try {
        const q = createMeasurementsQuery(id);
        
        return onSnapshot(q, (snapshot) => {
          const docs = snapshot.docs;
          const processedMeasurements = processMeasurementDocuments(docs).map(
            measurement => ({ ...measurement, unitId: id })
          );
          
          // Merge measurements with existing from other units
          setMeasurements(prev => {
            // Filter out measurements from this unit and add the new ones
            const filteredPrev = prev.filter(m => m.unitId !== id);
            return [...filteredPrev, ...processedMeasurements];
          });
          
          setIsLoading(false);
        }, (err) => {
          console.error(`Error fetching measurements for unit ${id}:`, err);
          setError(err);
          setIsLoading(false);
        });
      } catch (err) {
        console.error(`Error setting up measurements listener for unit ${id}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
        return () => {}; // Return a no-op cleanup function
      }
    });
    
    // Clean up all subscriptions when component unmounts or unitId changes
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [unitId]);

  return { measurements, isLoading, error };
}
