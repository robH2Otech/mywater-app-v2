
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
 * Updates a unit's total volume in Firestore with the latest 24h volume
 */
export async function updateUnitTotalVolume(
  unitId: string, 
  last24hVolume: number
): Promise<void> {
  try {
    if (!unitId || typeof last24hVolume !== 'number') {
      console.warn("Invalid parameters for updateUnitTotalVolume", { unitId, last24hVolume });
      return;
    }
    
    console.log(`Updating unit ${unitId} with last 24h volume: ${last24hVolume}`);
    
    const unitDocRef = doc(db, "units", unitId);
    await updateDoc(unitDocRef, {
      total_volume: last24hVolume,
      last_24h_volume: last24hVolume, // Store explicitly for reference
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error updating unit total volume:", err);
    throw err;
  }
}
