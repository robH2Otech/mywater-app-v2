
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

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
  latestCumulativeVolume: number
): Promise<void> {
  try {
    if (!unitId || typeof latestCumulativeVolume !== 'number') {
      console.warn("Invalid parameters for updateUnitTotalVolume", { unitId, latestCumulativeVolume });
      return;
    }
    
    const unitDocRef = doc(db, "units", unitId);
    await updateDoc(unitDocRef, {
      total_volume: latestCumulativeVolume,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error updating unit total volume:", err);
    throw err;
  }
}
