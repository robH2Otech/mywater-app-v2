
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
      console.warn(`Unit ${unitId} not found when fetching starting volume`);
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
 * Updates a unit's volume in Firestore based on the last 24 hours measurements
 */
export async function updateUnitVolume(
  unitId: string, 
  lastVolume: number
): Promise<void> {
  try {
    if (!unitId || typeof lastVolume !== 'number') {
      console.warn("Invalid parameters for updateUnitVolume", { unitId, lastVolume });
      return;
    }
    
    const unitDocRef = doc(db, "units", unitId);
    await updateDoc(unitDocRef, {
      volume: lastVolume,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error updating unit volume:", err);
    throw err;
  }
}
