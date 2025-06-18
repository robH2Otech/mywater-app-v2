
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

// These are all the possible paths where measurements could be stored
export const MEASUREMENT_PATHS = [
  // Primary paths - prioritize units/{unitId}/data for special units
  "units/{unitId}/data",
  "units/{unitId}/measurements",
  
  // MYWATER and X-WATER specific paths
  "measurements/{unitId}/hourly",
  "measurements/{unitId}/data",
  
  // Alternative naming patterns
  "units/{unitId}/sensor_data",
  "units/{unitId}/readings"
];

export function getMeasurementsCollectionPath(unitId: string, isMyWaterUnit?: boolean): string {
  // If isMyWaterUnit wasn't explicitly passed, check based on the ID
  if (isMyWaterUnit === undefined) {
    isMyWaterUnit = unitId.startsWith("MYWATER_") || unitId.startsWith("X-WATER");
  }
  
  // For MYWATER and X-WATER units, we prioritize specific paths
  if (isMyWaterUnit) {
    console.log(`Using MYWATER/X-WATER paths for unit ${unitId}`);
    // For these units, this is always the correct path
    return `units/${unitId}/data`;
  }
  
  // For other unit types
  if (unitId.includes("UVC")) {
    return `units/${unitId}/measurements`;
  }
  
  // Default path
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
    return null;
  }
}

// Function to try all possible measurement paths for a unit
export async function tryAllMeasurementPaths(unitId: string, count: number = 24) {
  const attemptedPaths = [];
  
  // For MYWATER and X-WATER units, prioritize these paths
  const isSpecialUnit = unitId.startsWith("MYWATER_") || unitId.startsWith("X-WATER");
  
  // Always try units/{unitId}/data first for special units
  if (isSpecialUnit) {
    const specialPath = `units/${unitId}/data`;
    console.log(`Trying primary path first for ${unitId}: ${specialPath}`);
    
    try {
      const measurementsQuery = query(
        collection(db, specialPath),
        orderBy("timestamp", "desc"),
        limit(count)
      );
      
      const snapshot = await getDocs(measurementsQuery);
      
      if (!snapshot.empty) {
        console.log(`✅ Found data at special unit path: ${specialPath}, count: ${snapshot.docs.length}`);
        return snapshot;
      }
    } catch (err) {
      console.warn(`Error checking special unit path: ${specialPath}`, err);
    }
  }
  
  // Continue with other paths if needed
  let prioritizedPaths = [...MEASUREMENT_PATHS];
  
  if (isSpecialUnit) {
    // Already tried units/{unitId}/data, so remove it
    const preferredPath = "units/{unitId}/data";
    const index = prioritizedPaths.indexOf(preferredPath);
    if (index !== -1) {
      prioritizedPaths.splice(index, 1);
    }
  }
  
  // Try paths sequentially with a small delay to avoid overwhelming Firestore
  for (const pathTemplate of prioritizedPaths) {
    const path = pathTemplate.replace('{unitId}', unitId);
    attemptedPaths.push(path);
    
    try {
      const snapshot = await tryCollectionPath(path, count);
      
      if (snapshot && !snapshot.empty) {
        console.log(`✅ Found data at path: ${path}, count: ${snapshot.docs.length}`);
        return snapshot;
      }
      
      // Small delay between attempts
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (err) {
      console.warn(`Error checking path: ${path}`, err);
    }
  }
  
  console.warn(`⚠️ No measurement data found for unit ${unitId} after checking paths: ${attemptedPaths.join(', ')}`);
  return null;
}
