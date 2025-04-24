
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useQuery } from "@tanstack/react-query";
import { ProcessedMeasurement } from "@/utils/measurements/types";
import { useState } from "react";

/**
 * Gets the correct collection path for measurements based on unit ID
 */
export function getMeasurementsCollectionPath(unitId: string): string {
  // Special case for MYWATER 003 units
  if (unitId === "MYWATER_003") {
    return "units/MYWATER_003/measurements";
  }
  
  // Default path structure
  return `measurements/${unitId}/data`;
}

/**
 * Creates a query for fetching measurements for a specific unit
 */
export function createMeasurementsQuery(unitId: string, count: number = 24) {
  const collectionPath = getMeasurementsCollectionPath(unitId);
  console.log(`Creating measurements query for unit ${unitId} using path: ${collectionPath}`);
  
  return query(
    collection(db, collectionPath),
    orderBy("timestamp", "desc"),
    limit(count)
  );
}

/**
 * Processes measurement documents from Firestore into a standard format
 */
export function processMeasurementDocuments(measurementDocs: any[]): ProcessedMeasurement[] {
  return measurementDocs.map(doc => {
    const data = doc.data();
    let timestamp = data.timestamp;
    let rawTimestamp = null;

    // Handle Firestore timestamp objects
    if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
      rawTimestamp = timestamp;
      timestamp = timestamp.toDate().toISOString();
    } else if (timestamp instanceof Date) {
      rawTimestamp = Timestamp.fromDate(timestamp);
      timestamp = timestamp.toISOString();
    }

    return {
      id: doc.id,
      timestamp: timestamp,
      rawTimestamp: rawTimestamp,
      volume: data.volume || 0,
      temperature: data.temperature || 0,
      uvc_hours: data.uvc_hours || 0,
      cumulative_volume: data.cumulative_volume || data.volume || 0,
      ...data
    };
  });
}

/**
 * Hook for fetching measurements for a specific unit or units
 */
export function useMeasurementCollection(unitId?: string | string[]) {
  const [measurements, setMeasurements] = useState<ProcessedMeasurement[]>([]);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["measurements", unitId],
    queryFn: async () => {
      // Handle undefined unit ID
      if (!unitId) {
        console.log("No unit ID provided, returning empty measurements");
        return [];
      }

      // Handle array of unit IDs
      if (Array.isArray(unitId)) {
        console.log("Fetching measurements for multiple units:", unitId);
        
        const allMeasurements: ProcessedMeasurement[] = [];
        
        for (const id of unitId) {
          if (!id) continue;
          
          const measurementsQuery = createMeasurementsQuery(id);
          const measurementsSnapshot = await getDocs(measurementsQuery);
          const unitMeasurements = processMeasurementDocuments(measurementsSnapshot.docs);
          
          allMeasurements.push(...unitMeasurements);
        }
        
        // Sort all measurements by timestamp (most recent first)
        allMeasurements.sort((a, b) => {
          const dateA = new Date(a.timestamp).getTime();
          const dateB = new Date(b.timestamp).getTime();
          return dateB - dateA;
        });
        
        return allMeasurements;
      }
      
      // Handle single unit ID
      console.log(`Fetching measurements for unit: ${unitId}`);
      const measurementsQuery = createMeasurementsQuery(unitId);
      const measurementsSnapshot = await getDocs(measurementsQuery);
      
      return processMeasurementDocuments(measurementsSnapshot.docs);
    },
    enabled: !!unitId,
  });
  
  // Update measurements state when data changes
  if (data && data !== measurements) {
    setMeasurements(data);
  }
  
  return {
    measurements: measurements || [],
    isLoading,
    error,
    refetch
  };
}
