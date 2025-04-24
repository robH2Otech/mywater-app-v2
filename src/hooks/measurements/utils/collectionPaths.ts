
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

// These are all the possible paths where measurements could be stored
export const MEASUREMENT_PATHS = [
  "units/{unitId}/measurements",
  "units/{unitId}/data",
  "measurements/{unitId}/data",
  "device-data/{unitId}/measurements"
];

export function getMeasurementsCollectionPath(unitId: string): string {
  // For MYWATER units, we need to check multiple possible paths
  if (unitId.startsWith("MYWATER_")) {
    // Try both paths for MYWATER units to ensure we find data
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
    throw error;
  }
}

// Function to try all possible measurement paths for a unit
export async function tryAllMeasurementPaths(unitId: string, count: number = 24) {
  for (const pathTemplate of MEASUREMENT_PATHS) {
    const path = pathTemplate.replace('{unitId}', unitId);
    try {
      console.log(`Trying path: ${path}`);
      const snapshot = await tryCollectionPath(path);
      
      if (!snapshot.empty) {
        console.log(`Found data at path: ${path}, count: ${snapshot.docs.length}`);
        return snapshot;
      }
    } catch (err) {
      console.warn(`No data found at path: ${path}`);
    }
  }
  
  console.warn(`No measurement data found for unit ${unitId} in any collection`);
  return null;
}
