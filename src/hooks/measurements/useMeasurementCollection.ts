
import { useState, useEffect } from "react";
import { 
  getMeasurementsCollectionPath, 
  createMeasurementsQuery, 
  processMeasurementDocuments 
} from "./useMeasurementCollection";
import { onSnapshot } from "firebase/firestore";
import { ProcessedMeasurement } from "@/utils/measurements/types";

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
