
import { collection, query, where, orderBy, limit, getDocs, Timestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useQuery } from "@tanstack/react-query";
import { ProcessedMeasurement } from "@/utils/measurements/types";
import { useState } from "react";

// Array of possible measurement collection paths to try for each unit
const MEASUREMENT_PATHS = [
  "units/{unitId}/measurements",
  "units/{unitId}/data",
  "measurements/{unitId}/data",
  "device-data/{unitId}/measurements"
];

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
    
    // Extract unit ID from path if available
    const unitId = data.unit_id || data.unitId || doc.ref?.path?.split('/')[1] || '';

    return {
      id: doc.id,
      timestamp: timestamp,
      rawTimestamp: rawTimestamp,
      volume: data.volume !== undefined ? data.volume : 0,
      temperature: data.temperature !== undefined ? data.temperature : 0,
      uvc_hours: data.uvc_hours !== undefined ? data.uvc_hours : 0,
      cumulative_volume: data.cumulative_volume !== undefined ? data.cumulative_volume : (data.volume || 0),
      unitId: unitId,
      ...data
    };
  });
}

/**
 * Try fetching data from all possible collection paths for a unit
 */
async function tryAllPaths(unitId: string, count: number = 24): Promise<ProcessedMeasurement[]> {
  // First try the standard path
  const standardPath = getMeasurementsCollectionPath(unitId);
  console.log(`First trying standard path for ${unitId}: ${standardPath}`);
  
  const standardQuery = query(
    collection(db, standardPath),
    orderBy("timestamp", "desc"),
    limit(count)
  );
  
  const standardSnapshot = await getDocs(standardQuery);
  
  if (!standardSnapshot.empty) {
    console.log(`Found ${standardSnapshot.size} measurements in standard path for ${unitId}`);
    return processMeasurementDocuments(standardSnapshot.docs);
  }
  
  // If standard path fails, try all other paths
  console.log(`No data found in standard path for ${unitId}, trying alternative paths`);
  
  for (const pathTemplate of MEASUREMENT_PATHS) {
    const path = pathTemplate.replace('{unitId}', unitId);
    if (path === standardPath) continue; // Skip if it's the same as standard path
    
    console.log(`Trying alternative path for ${unitId}: ${path}`);
    
    try {
      const altQuery = query(
        collection(db, path),
        orderBy("timestamp", "desc"),
        limit(count)
      );
      
      const altSnapshot = await getDocs(altQuery);
      
      if (!altSnapshot.empty) {
        console.log(`Found ${altSnapshot.size} measurements in alternative path: ${path}`);
        return processMeasurementDocuments(altSnapshot.docs);
      }
    } catch (err) {
      console.log(`Error accessing path ${path} for ${unitId}: ${err}`);
      // Continue to next path, don't throw error
    }
  }
  
  // Special case for MYWATER_003
  if (unitId === "MYWATER_003") {
    try {
      console.log(`Trying special case lookup for MYWATER_003`);
      const unitDoc = await getDoc(doc(db, "units", "MYWATER_003"));
      
      if (unitDoc.exists() && unitDoc.data().measurements) {
        console.log(`Found inline measurements in unit document for MYWATER_003`);
        const measurements = Array.isArray(unitDoc.data().measurements) ? 
          unitDoc.data().measurements : [unitDoc.data().measurements];
          
        // Convert to standard format
        return measurements.slice(0, count).map((measurement: any, index: number) => ({
          id: `inline-measurement-${index}`,
          timestamp: measurement.timestamp?.toDate?.() || new Date(),
          rawTimestamp: measurement.timestamp,
          volume: measurement.volume || 0,
          temperature: measurement.temperature || 0,
          uvc_hours: measurement.uvc_hours || 0,
          cumulative_volume: measurement.volume || 0,
          unitId: "MYWATER_003"
        }));
      }
    } catch (err) {
      console.error(`Special case lookup failed for MYWATER_003: ${err}`);
    }
  }
  
  // If all else fails, try to synthesize some dummy data for demo or test purposes
  console.log(`No measurement data found for ${unitId} across all paths`);
  return [];
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
          
          const unitMeasurements = await tryAllPaths(id);
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
      return await tryAllPaths(unitId);
    },
    enabled: !!unitId,
    staleTime: 60000, // 1 minute
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
