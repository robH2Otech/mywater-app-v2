
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { FirebaseFirestore } from "firebase/firestore";

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
export function processMeasurementDocuments(measurementDocs: any[]) {
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
