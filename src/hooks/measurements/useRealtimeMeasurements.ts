
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { onSnapshot, query, collection, orderBy, limit, where, Timestamp } from "firebase/firestore";
import { Measurement } from "@/utils/measurements/types";
import { 
  fetchUnitStartingVolume, 
  updateUnitTotalVolume 
} from "./useUnitVolume";
import { 
  getMeasurementsCollectionPath
} from "./useMeasurementCollection";
import { db } from "@/integrations/firebase/client";

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
      // Calculate timestamp for 24 hours ago
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      const timestamp24HoursAgo = Timestamp.fromDate(twentyFourHoursAgo);
      
      // Get the collection path
      const collectionPath = getMeasurementsCollectionPath(unitId);
      const measurementsCollectionRef = collection(db, collectionPath);
      
      // Create query that filters for only the last 24 hours of data
      const measurementsQuery = query(
        measurementsCollectionRef,
        where("raw_timestamp", ">=", timestamp24HoursAgo),
        orderBy("raw_timestamp", "desc"),
        limit(count)
      );
      
      unsubscribe = onSnapshot(
        measurementsQuery,
        async (querySnapshot) => {
          try {
            // Process the documents to create measurement objects
            const measurementsData = querySnapshot.docs.map(doc => {
              const data = doc.data();
              
              // Format timestamp if needed
              if (data.timestamp) {
                if (typeof data.timestamp === 'object' && data.timestamp.toDate) {
                  const date = data.timestamp.toDate();
                  data.timestamp = date.toLocaleString();
                }
              }
              
              return {
                id: doc.id,
                ...data
              } as Measurement & { id: string };
            });
            
            // Sort by timestamp (newest first)
            measurementsData.sort((a, b) => {
              if (!a.timestamp || !b.timestamp) return 0;
              return b.timestamp.localeCompare(a.timestamp);
            });
            
            setMeasurements(measurementsData);
            setIsLoading(false);
            
            // Calculate total volume in the last 24 hours
            const last24hVolume = measurementsData.reduce((total, measurement) => {
              return total + (typeof measurement.volume === 'number' ? measurement.volume : 0);
            }, 0);
            
            // Update the unit's total_volume with the last 24h volume
            if (measurementsData.length > 0) {
              await updateUnitTotalVolume(unitId, last24hVolume);
              
              // Invalidate queries to refresh UI
              queryClient.invalidateQueries({ queryKey: ['units'] });
              queryClient.invalidateQueries({ queryKey: ['filter-units'] });
              queryClient.invalidateQueries({ queryKey: ['unit', unitId] });
            }
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
