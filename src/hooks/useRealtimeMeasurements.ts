
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, limit, getDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { Measurement } from "@/utils/measurements/types";
import { safeFormatTimestamp } from "@/utils/measurements/formatUtils";

export function useRealtimeMeasurements(unitId: string, count: number = 24) {
  const [measurements, setMeasurements] = useState<(Measurement & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
      // First, get the unit's current total volume
      const fetchUnitTotalVolume = async () => {
        try {
          const unitDocRef = doc(db, "units", unitId);
          const unitDoc = await getDoc(unitDocRef);
          
          if (!unitDoc.exists()) {
            console.warn(`Unit ${unitId} not found when fetching total volume`);
            return 0;
          }
          
          const unitData = unitDoc.data();
          return typeof unitData.total_volume === 'number' ? unitData.total_volume : 0;
        } catch (err) {
          console.error("Error fetching unit total volume:", err);
          return 0;
        }
      };
      
      // Use data subcollection instead of measurements for MYWATER_ units
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
      
      // Set up real-time listener
      unsubscribe = onSnapshot(
        q,
        async (querySnapshot) => {
          // Get the current total volume from the unit document
          const currentTotalVolume = await fetchUnitTotalVolume();
          
          // Convert docs to measurement objects
          const measurementsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            
            // Enhanced timestamp handling
            if (data.timestamp) {
              // Handle various timestamp formats from Firestore
              data.timestamp = safeFormatTimestamp(data.timestamp);
            } else {
              data.timestamp = "Invalid date";
            }
            
            // Ensure cumulative_volume is populated
            if (data.cumulative_volume === undefined || data.cumulative_volume === null) {
              // If we don't have a cumulative volume, we need to calculate it
              if (typeof data.volume === 'number') {
                // For now, just use the current total - this will be improved in dataUtils
                data.cumulative_volume = currentTotalVolume;
              } else {
                data.cumulative_volume = 0;
              }
            }
            
            return {
              id: doc.id,
              ...data
            };
          }) as (Measurement & { id: string })[];
          
          setMeasurements(measurementsData);
          setIsLoading(false);
        },
        (err) => {
          console.error(`Error listening to ${isMyWaterUnit ? 'data' : 'measurements'}:`, err);
          setError(err as Error);
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.error(`Failed to set up ${unitId.startsWith('MYWATER_') ? 'data' : 'measurements'} listener:`, err);
      setError(err as Error);
      setIsLoading(false);
    }

    // Clean up the listener when the component unmounts or unitId changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [unitId, count]);

  return { measurements, isLoading, error };
}
