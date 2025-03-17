
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { Measurement, ProcessedMeasurement } from "@/utils/measurements/types";
import { safeFormatTimestamp } from "@/utils/measurements/formatUtils";

/**
 * Determines the correct Firestore collection path for a unit's measurements
 */
export function getMeasurementsCollectionPath(unitId: string): string {
  const isMyWaterUnit = unitId.startsWith('MYWATER_');
  return isMyWaterUnit ? `units/${unitId}/data` : `units/${unitId}/measurements`;
}

/**
 * Creates a Firestore query for a unit's measurements
 */
export function createMeasurementsQuery(unitId: string, count: number = 24) {
  const collectionPath = getMeasurementsCollectionPath(unitId);
  const measurementsCollectionRef = collection(db, collectionPath);
  
  return query(
    measurementsCollectionRef,
    orderBy("timestamp", "desc"), // Get most recent first
    limit(count) // Limit to the specified count (default 24)
  );
}

/**
 * Transforms raw Firestore document data into ProcessedMeasurement objects
 * with correctly formatted timestamps and required id field
 */
export function processMeasurementDocuments(
  docs: any[]
): ProcessedMeasurement[] {
  // Convert all documents to measurement objects with correctly formatted timestamps
  const measurements = docs.map(doc => {
    const data = doc.data();
    const measurement: ProcessedMeasurement = {
      id: doc.id,
      timestamp: data.timestamp ? safeFormatTimestamp(data.timestamp) : "Invalid date",
      volume: typeof data.volume === 'number' ? data.volume : parseFloat(data.volume || '0'),
      temperature: typeof data.temperature === 'number' ? data.temperature : parseFloat(data.temperature || '0'),
    };
    
    // Add optional fields if they exist in the data
    if (data.uvc_hours !== undefined) {
      measurement.uvc_hours = typeof data.uvc_hours === 'number' 
        ? data.uvc_hours 
        : parseFloat(data.uvc_hours || '0');
    }
    
    if (data.cumulative_volume !== undefined) {
      measurement.cumulative_volume = typeof data.cumulative_volume === 'number'
        ? data.cumulative_volume
        : parseFloat(data.cumulative_volume || '0');
    }
    
    return measurement;
  });
  
  return measurements;
}
