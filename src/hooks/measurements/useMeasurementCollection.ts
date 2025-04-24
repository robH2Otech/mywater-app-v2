
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useQuery } from "@tanstack/react-query";
import { ProcessedMeasurement } from "@/utils/measurements/types";
import { useState } from "react";

/**
 * Gets the correct collection path for measurements based on unit ID
 */
export function getMeasurementsCollectionPath(unitId: string): string {
  // Special case handling for different paths based on unit ID patterns
  if (unitId === "MYWATER_003") {
    return "units/MYWATER_003/measurements";
  }
  
  // Check if it's a MYWATER unit (excluding special cases)
  if (unitId.startsWith("MYWATER_")) {
    return `units/${unitId}/data`;
  }
  
  // Try additional paths for different unit types
  return `units/${unitId}/measurements`;
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
          
          // If no measurements found in primary path, try alternative paths
          if (measurementsSnapshot.empty) {
            console.log(`No measurements found in primary path for unit ${id}, trying alternatives`);
            
            // Try additional collection paths
            const alternativePaths = [
              `measurements/${id}/data`,
              `units/${id}/measurements`,
              `units/${id}/data`
            ];
            
            for (const path of alternativePaths) {
              console.log(`Trying alternative path for ${id}: ${path}`);
              const altQuery = query(
                collection(db, path),
                orderBy("timestamp", "desc"),
                limit(24)
              );
              
              const altSnapshot = await getDocs(altQuery);
              if (!altSnapshot.empty) {
                console.log(`Found ${altSnapshot.size} measurements in alternative path: ${path}`);
                const unitMeasurements = processMeasurementDocuments(altSnapshot.docs);
                allMeasurements.push(...unitMeasurements);
                break; // Found measurements, stop trying alternatives
              }
            }
          } else {
            const unitMeasurements = processMeasurementDocuments(measurementsSnapshot.docs);
            allMeasurements.push(...unitMeasurements);
          }
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
      
      // If no measurements found in primary path, try alternative paths
      if (measurementsSnapshot.empty) {
        console.log(`No measurements found in primary path for unit ${unitId}, trying alternatives`);
        
        // Try additional collection paths
        const alternativePaths = [
          `measurements/${unitId}/data`,
          `units/${unitId}/measurements`,
          `units/${unitId}/data`
        ];
        
        for (const path of alternativePaths) {
          console.log(`Trying alternative path for ${unitId}: ${path}`);
          const altQuery = query(
            collection(db, path),
            orderBy("timestamp", "desc"),
            limit(24)
          );
          
          const altSnapshot = await getDocs(altQuery);
          if (!altSnapshot.empty) {
            console.log(`Found ${altSnapshot.size} measurements in alternative path: ${path}`);
            return processMeasurementDocuments(altSnapshot.docs);
          }
        }
      }
      
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
