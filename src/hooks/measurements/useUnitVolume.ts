
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { getMeasurementsCollectionPath } from "./utils/collectionPaths";

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
 * Updates a unit's total volume in Firestore based on the latest measurement
 */
export async function updateUnitTotalVolume(
  unitId: string, 
  latestVolume: number
): Promise<void> {
  try {
    if (!unitId || typeof latestVolume !== 'number') {
      console.warn("Invalid parameters for updateUnitTotalVolume", { unitId, latestVolume });
      return;
    }
    
    const unitDocRef = doc(db, "units", unitId);
    await updateDoc(unitDocRef, {
      total_volume: latestVolume,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error updating unit total volume:", err);
    throw err;
  }
}

/**
 * Fetches the latest recorded volume measurement for a unit
 */
export async function fetchLatestVolume(unitId: string): Promise<number> {
  try {
    if (!unitId) {
      return 0;
    }
    
    const collectionPath = getMeasurementsCollectionPath(unitId);
    const measurementsQuery = query(
      collection(db, collectionPath),
      orderBy("timestamp", "desc"),
      limit(1)
    );
    
    const querySnapshot = await getDocs(measurementsQuery);
    
    if (querySnapshot.empty) {
      return 0;
    }
    
    const latestMeasurement = querySnapshot.docs[0].data();
    return typeof latestMeasurement.volume === 'number' ? latestMeasurement.volume : 0;
  } catch (err) {
    console.error("Error fetching latest volume:", err);
    return 0;
  }
}
