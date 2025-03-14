
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
    orderBy("timestamp", "desc"),
    limit(count)
  );
}

/**
 * Transforms raw Firestore document data into Measurement objects
 * with correctly formatted timestamps and calculated cumulative volumes
 */
export function processMeasurementDocuments(
  docs: any[], 
  startingVolume: number
): (Measurement & { id: string })[] {
  return docs.map((doc, index, array) => {
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
}
