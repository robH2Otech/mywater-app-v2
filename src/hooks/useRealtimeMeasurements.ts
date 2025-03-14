
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { Measurement } from "@/utils/measurements/types";

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
      
      unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const measurementsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
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
