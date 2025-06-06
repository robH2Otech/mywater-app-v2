
import { collection, query, where, getDocs, orderBy, limit, getDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

/**
 * Verify if a unit has any location history or updates
 * @param iccid The unit's ICCID to check
 * @returns Boolean indicating if the unit has any location history
 */
export async function verifyLocationUpdates(iccid: string): Promise<boolean> {
  try {
    if (!iccid) return false;
    
    // Normalize ICCID
    const normalizedIccid = iccid.replace(/\s+/g, '').trim();
    console.log(`Verifying location updates for normalized ICCID: ${normalizedIccid}`);
    
    // First, find the unit ID associated with this ICCID
    const unitsRef = collection(db, "units");
    const q = query(unitsRef, where("iccid", "==", normalizedIccid), limit(1));
    let snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Try with partial match
      console.log("No exact ICCID match found, trying partial match");
      const allUnitsSnapshot = await getDocs(collection(db, "units"));
      const matchingUnit = allUnitsSnapshot.docs.find(doc => {
        const unitData = doc.data();
        return unitData.iccid && 
               (unitData.iccid.includes(normalizedIccid) || normalizedIccid.includes(unitData.iccid));
      });
      
      if (!matchingUnit) {
        console.log(`No unit found with ICCID ${normalizedIccid}`);
        return false;
      }
      
      const unitId = matchingUnit.id;
      const unitData = matchingUnit.data();
      
      // Check if unit already has location data
      const hasLocation = !!(unitData.lastKnownLatitude && unitData.lastKnownLongitude);
      console.log(`Unit ${unitId} has location data: ${hasLocation}`);
      
      if (hasLocation) {
        console.log(`Location data for unit ${unitId}: ${unitData.lastKnownLatitude}, ${unitData.lastKnownLongitude}`);
      }
      
      return hasLocation;
    } else {
      const unitId = snapshot.docs[0].id;
      const unitData = snapshot.docs[0].data();
      
      // Check if unit already has location data
      const hasLocation = !!(unitData.lastKnownLatitude && unitData.lastKnownLongitude);
      console.log(`Unit ${unitId} has location data: ${hasLocation}`);
      
      if (hasLocation) {
        console.log(`Location data for unit ${unitId}: ${unitData.lastKnownLatitude}, ${unitData.lastKnownLongitude}`);
      }
      
      return hasLocation;
    }
  } catch (error) {
    console.error("Error verifying location updates:", error);
    return false;
  }
}

/**
 * Find unit ID by ICCID with flexible matching
 * @param iccid The ICCID to search for
 * @returns Unit ID if found, null otherwise
 */
export async function findUnitIdByIccid(iccid: string): Promise<string | null> {
  try {
    if (!iccid) return null;
    
    const normalizedIccid = iccid.replace(/\s+/g, '').trim();
    console.log(`Finding unit ID for normalized ICCID: ${normalizedIccid}`);
    
    // First try exact match
    const unitsRef = collection(db, "units");
    const q = query(unitsRef, where("iccid", "==", normalizedIccid), limit(1));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const unitId = snapshot.docs[0].id;
      console.log(`Found unit ID ${unitId} with exact ICCID match`);
      return unitId;
    }
    
    // Try flexible matching
    console.log(`No exact match found, trying flexible matching for ICCID: ${normalizedIccid}`);
    const allUnitsSnapshot = await getDocs(collection(db, "units"));
    const matchingUnit = allUnitsSnapshot.docs.find(doc => {
      const unitData = doc.data();
      const unitIccid = unitData.iccid;
      if (!unitIccid) return false;
      
      // Try to match either direction
      if (unitIccid.includes(normalizedIccid) || normalizedIccid.includes(unitIccid)) {
        console.log(`Found partial match: Unit ICCID=${unitIccid}, Search ICCID=${normalizedIccid}`);
        return true;
      }
      return false;
    });
    
    if (matchingUnit) {
      console.log(`Found unit ID ${matchingUnit.id} with flexible ICCID matching`);
      return matchingUnit.id;
    } else {
      console.log(`No unit found with ICCID ${normalizedIccid} (either exact or flexible match)`);
      return null;
    }
  } catch (error) {
    console.error("Error finding unit by ICCID:", error);
    return null;
  }
}
