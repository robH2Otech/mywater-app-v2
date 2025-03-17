
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { Measurement } from "@/utils/measurements/types";
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
 * Transforms raw Firestore document data into Measurement objects
 * with correctly formatted timestamps
 */
export function processMeasurementDocuments(
  docs: any[]
): (Measurement & { id: string })[] {
  // Convert all documents to measurement objects with correctly formatted timestamps
  const measurements = docs.map(doc => {
    const data = doc.data();
    
    // Handle timestamp
    if (data.timestamp) {
      data.timestamp = safeFormatTimestamp(data.timestamp);
    } else {
      data.timestamp = "Invalid date";
    }
    
    return {
      id: doc.id,
      ...data,
    } as Measurement & { id: string };
  });
  
  // Return in the original order (desc for display - newest first)
  return measurements;
}
