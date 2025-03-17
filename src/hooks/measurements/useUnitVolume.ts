
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { getMeasurementsCollectionPath } from "./useMeasurementCollection";

/**
 * Fetches a unit's starting volume from Firestore
 */
export async function fetchUnitStartingVolume(unitId: string): Promise<number> {
  try {
    const unitDocRef = doc(db, "units", unitId);
    const unitDoc = await getDoc(unitDocRef);
    
    if (!unitDoc.exists()) {
      console.warn(`Unit ${unitId} not found when fetching total volume`);
      return 0;
    }
    
    const unitData = unitDoc.data();
    return typeof unitData.starting_volume === 'number' ? unitData.starting_volume : 0;
  } catch (err) {
    console.error("Error fetching unit starting volume:", err);
    return 0;
  }
}

/**
 * Fetches a unit's last 24 hours volume
 */
export async function fetchLast24HoursVolume(unitId: string): Promise<number> {
  try {
    if (!unitId) return 0;
    
    const collectionPath = getMeasurementsCollectionPath(unitId);
    const measurementsCollectionRef = collection(db, collectionPath);
    
    // Get the last 24 measurements (assuming 1 per hour)
    const measurementsQuery = query(
      measurementsCollectionRef,
      orderBy("timestamp", "desc"),
      limit(24)
    );
    
    const querySnapshot = await getDocs(measurementsQuery);
    
    // Sum up all volumes from the measurements
    let totalVolume = 0;
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.volume && typeof data.volume === 'number') {
        totalVolume += data.volume;
      }
    });
    
    return totalVolume;
  } catch (err) {
    console.error("Error fetching last 24 hours volume:", err);
    return 0;
  }
}

/**
 * Updates a unit's volume in Firestore based on the last 24 hours measurements
 */
export async function updateUnitVolume(
  unitId: string, 
  last24HoursVolume: number
): Promise<void> {
  try {
    if (!unitId || typeof last24HoursVolume !== 'number') {
      console.warn("Invalid parameters for updateUnitVolume", { unitId, last24HoursVolume });
      return;
    }
    
    const unitDocRef = doc(db, "units", unitId);
    await updateDoc(unitDocRef, {
      volume: last24HoursVolume,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error updating unit volume:", err);
    throw err;
  }
}
