
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

/**
 * Verify if a unit has any location history or updates
 * @param iccid The unit's ICCID to check
 * @returns Boolean indicating if the unit has any location history
 */
export async function verifyLocationUpdates(iccid: string): Promise<boolean> {
  try {
    if (!iccid) return false;
    
    // First, find the unit ID associated with this ICCID
    const unitsRef = collection(db, "units");
    const q = query(unitsRef, where("iccid", "==", iccid), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Try alternative search
      const allUnitsSnapshot = await getDocs(collection(db, "units"));
      const matchingUnit = allUnitsSnapshot.docs.find(doc => {
        const unitData = doc.data();
        return unitData.iccid && 
               (unitData.iccid.includes(iccid) || iccid.includes(unitData.iccid));
      });
      
      if (!matchingUnit) return false;
      
      const unitId = matchingUnit.id;
      const unitData = matchingUnit.data();
      
      // Check if unit already has location data
      return !!(unitData.lastKnownLatitude && unitData.lastKnownLongitude);
    } else {
      const unitId = snapshot.docs[0].id;
      const unitData = snapshot.docs[0].data();
      
      // Check if unit already has location data
      return !!(unitData.lastKnownLatitude && unitData.lastKnownLongitude);
    }
  } catch (error) {
    console.error("Error verifying location updates:", error);
    return false;
  }
}
