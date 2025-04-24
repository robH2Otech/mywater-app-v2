
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

// These are all the possible paths where measurements could be stored
export const MEASUREMENT_PATHS = [
  "units/{unitId}/measurements",
  "units/{unitId}/data",
  "measurements/{unitId}/data",
  "device-data/{unitId}/measurements",
  // Additional paths for MYWATER units
  "measurements/{unitId}/hourly",
  "devices/{unitId}/data"
];

export function getMeasurementsCollectionPath(unitId: string): string {
  // For MYWATER units, we need specific paths
  if (unitId.startsWith("MYWATER_")) {
    return `units/${unitId}/data`;
  }
  
  // Logic for other unit types
  if (unitId.includes("UVC")) {
    return `units/${unitId}/measurements`;
  }
  
  return `units/${unitId}/measurements`;
}

// Function to try fetching from a specific collection path
export async function tryCollectionPath(path: string, count: number = 24) {
  try {
    console.log(`Trying to fetch measurements from: ${path}`);
    const measurementsQuery = query(
      collection(db, path),
      orderBy("timestamp", "desc"),
      limit(count)
    );
    
    return await getDocs(measurementsQuery);
  } catch (error) {
    console.warn(`Error fetching from path ${path}:`, error);
    return null; // Return null instead of throwing to continue with other paths
  }
}

// Function to try all possible measurement paths for a unit
export async function tryAllMeasurementPaths(unitId: string, count: number = 24) {
  const attemptedPaths = [];
  
  for (const pathTemplate of MEASUREMENT_PATHS) {
    const path = pathTemplate.replace('{unitId}', unitId);
    attemptedPaths.push(path);
    
    try {
      console.log(`Trying path: ${path} for unit ${unitId}`);
      const snapshot = await tryCollectionPath(path, count);
      
      if (snapshot && !snapshot.empty) {
        console.log(`✅ Found data at path: ${path}, count: ${snapshot.docs.length}`);
        return snapshot;
      } else {
        console.log(`❌ No data at path: ${path}`);
      }
    } catch (err) {
      console.warn(`Error checking path: ${path}`, err);
    }
  }
  
  console.warn(`⚠️ No measurement data found for unit ${unitId} after checking paths: ${attemptedPaths.join(', ')}`);
  return null;
}
