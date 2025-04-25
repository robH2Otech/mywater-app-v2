
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
  latestVolume: number,
  unitType: string = 'uvc'
): Promise<void> {
  try {
    if (!unitId || typeof latestVolume !== 'number') {
      console.warn("Invalid parameters for updateUnitTotalVolume", { unitId, latestVolume });
      return;
    }
    
    // Skip updates with unreasonable values based on unit type
    const isFilterUnit = unitType === 'drop' || unitType === 'office';
    
    // Validate volume based on unit type
    if (isFilterUnit && (latestVolume > 10000 || latestVolume < 0)) {
      console.warn(`Skipping update for filter unit ${unitId}: Unreasonable volume value ${latestVolume}L`);
      return;
    }
    
    if (!isFilterUnit && (latestVolume > 1000000 || latestVolume < 0)) {
      console.warn(`Skipping update for UVC unit ${unitId}: Unreasonable volume value ${latestVolume}m³`);
      return;
    }
    
    console.log(`Updating unit ${unitId} total_volume to ${latestVolume} (${isFilterUnit ? 'L' : 'm³'})`);
    
    const unitDocRef = doc(db, "units", unitId);
    await updateDoc(unitDocRef, {
      total_volume: latestVolume,
      updated_at: new Date().toISOString()
    });
    
    console.log(`Successfully updated unit ${unitId} total_volume`);
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
    
    // Get the unit type to determine how to process volume
    const unitDocRef = doc(db, "units", unitId);
    const unitDoc = await getDoc(unitDocRef);
    const unitData = unitDoc.exists() ? unitDoc.data() : null;
    const unitType = unitData?.unit_type || 'uvc';
    const isFilterUnit = unitType === 'drop' || unitType === 'office';
    
    // For filter units, use the direct volume value
    // For UVC units, use cumulative_volume if available
    if (isFilterUnit) {
      // For filter units, just use the direct volume value
      return typeof latestMeasurement.volume === 'number' ? latestMeasurement.volume : 0;
    } else {
      // For UVC units, use cumulative_volume if available, otherwise use volume
      return typeof latestMeasurement.cumulative_volume === 'number' 
        ? latestMeasurement.cumulative_volume 
        : typeof latestMeasurement.volume === 'number' ? latestMeasurement.volume : 0;
    }
  } catch (err) {
    console.error("Error fetching latest volume:", err);
    return 0;
  }
}
