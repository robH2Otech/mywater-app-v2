
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { Measurement } from "@/utils/measurementUtils";

export function useRealtimeMeasurements(unitId: string, count: number = 10) {
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
      // For all units, query the collection with ordering and limiting
      const measurementsCollectionRef = collection(db, `units/${unitId}/measurements`);
      const q = query(
        measurementsCollectionRef,
        orderBy("timestamp", "desc"),
        limit(count)
      );
      
      unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const measurementsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as (Measurement & { id: string })[];
          
          setMeasurements(measurementsData);
          setIsLoading(false);
        },
        (err) => {
          console.error("Error listening to measurements:", err);
          setError(err as Error);
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.error("Failed to set up measurements listener:", err);
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
