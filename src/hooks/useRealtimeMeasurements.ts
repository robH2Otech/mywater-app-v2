
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, limit, getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { Measurement } from "@/utils/measurements/types";
import { safeFormatTimestamp } from "@/utils/measurements/formatUtils";
import { useQueryClient } from "@tanstack/react-query";

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
      // First, get the unit's starting volume
      const fetchUnitStartingVolume = async () => {
        try {
          const unitDocRef = doc(db, "units", unitId);
          const unitDoc = await getDoc(unitDocRef);
          
          if (!unitDoc.exists()) {
            console.warn(`Unit ${unitId} not found when fetching total volume`);
            return 0;
          }
          
          const unitData = unitDoc.data();
          return typeof unitData.starting_volume === 'number' ? unitData.starting_volume : 0;
        } catch (err) {
          console.error("Error fetching unit starting volume:", err);
          return 0;
        }
      };
      
      const isMyWaterUnit = unitId.startsWith('MYWATER_');
      const collectionPath = isMyWaterUnit 
        ? `units/${unitId}/data` 
        : `units/${unitId}/measurements`;
      
      const measurementsCollectionRef = collection(db, collectionPath);
      const q = query(
        measurementsCollectionRef,
        orderBy("timestamp", "desc"),
        limit(count)
      );
      
      unsubscribe = onSnapshot(
        q,
        async (querySnapshot) => {
          const startingVolume = await fetchUnitStartingVolume();
          
          // Convert docs to measurement objects and calculate cumulative
          const measurementsData = querySnapshot.docs.map((doc, index, array) => {
            const data = doc.data();
            
            // Handle timestamp
            if (data.timestamp) {
              data.timestamp = safeFormatTimestamp(data.timestamp);
            } else {
              data.timestamp = "Invalid date";
            }
            
            // Calculate proper cumulative volume
            // Since we're getting data in desc order, we need to reverse calculate
            let cumulativeVolume = startingVolume;
            for (let i = array.length - 1; i >= index; i--) {
              const measurementVolume = array[i].data().volume || 0;
              cumulativeVolume += measurementVolume;
            }
            
            return {
              id: doc.id,
              ...data,
              cumulative_volume: cumulativeVolume
            } as Measurement & { id: string };
          });
          
          setMeasurements(measurementsData);
          setIsLoading(false);
          
          // Update the unit's total_volume with the latest cumulative volume
          if (measurementsData.length > 0) {
            const latestMeasurement = measurementsData[0]; // First item (most recent)
            const unitDocRef = doc(db, "units", unitId);
            await updateDoc(unitDocRef, {
              total_volume: latestMeasurement.cumulative_volume,
              updated_at: new Date().toISOString()
            });
            
            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['units'] });
            queryClient.invalidateQueries({ queryKey: ['filter-units'] });
            queryClient.invalidateQueries({ queryKey: ['unit', unitId] });
          }
        },
        (err) => {
          console.error(`Error listening to ${isMyWaterUnit ? 'data' : 'measurements'}:`, err);
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
