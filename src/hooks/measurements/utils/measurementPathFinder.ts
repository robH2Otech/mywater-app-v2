
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { MEASUREMENT_PATHS } from "./collectionPaths";

// Cache for successful paths to avoid repeated lookups
const successfulPathsCache = new Map<string, string>();

/**
 * Try to find the correct measurement path for a unit by trying each path sequentially
 */
export async function findMeasurementPath(unitId: string): Promise<string | null> {
  // Check cache first
  if (successfulPathsCache.has(unitId)) {
    const cachedPath = successfulPathsCache.get(unitId);
    console.log(`Using cached measurement path for ${unitId}: ${cachedPath}`);
    return cachedPath || null;
  }

  // For MYWATER units, try the preferred path first
  const isMyWaterUnit = unitId.startsWith("MYWATER_");
  let pathsToTry = [...MEASUREMENT_PATHS];
  
  if (isMyWaterUnit) {
    // For MYWATER units, always prioritize this path as it's the most reliable
    const myWaterPriorityPath = "units/{unitId}/data";
    
    // Remove this path from the original array to avoid duplicates
    pathsToTry = pathsToTry.filter(path => path !== myWaterPriorityPath);
    
    // Add priority path at the beginning
    pathsToTry = [myWaterPriorityPath, ...pathsToTry];
    console.log(`MYWATER unit detected (${unitId}). Prioritizing path: ${myWaterPriorityPath}`);
  }

  // Try each path sequentially with a small delay between attempts
  for (const pathTemplate of pathsToTry) {
    const path = pathTemplate.replace('{unitId}', unitId);
    
    try {
      console.log(`Checking path: ${path} for unit ${unitId}`);
      const measurementsRef = collection(db, path);
      const testQuery = query(
        measurementsRef,
        orderBy("timestamp", "desc"),
        limit(1)
      );
      
      const snapshot = await getDocs(testQuery);
      
      if (!snapshot.empty) {
        console.log(`✅ Found valid path with data: ${path} for unit ${unitId}`);
        // Store in cache for future use
        successfulPathsCache.set(unitId, path);
        return path;
      } else {
        console.log(`Path exists but empty: ${path} for unit ${unitId}`);
      }
    } catch (err) {
      console.log(`❌ Invalid path ${path} for unit ${unitId}: ${err.message}`);
    }
    
    // Small delay to avoid overwhelming Firestore with requests
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.warn(`⚠️ No valid measurement path found for unit ${unitId}`);
  
  // For MYWATER units, default to units/{unitId}/data even if empty
  if (isMyWaterUnit) {
    const defaultPath = `units/${unitId}/data`;
    console.log(`Using default path for MYWATER unit: ${defaultPath}`);
    successfulPathsCache.set(unitId, defaultPath);
    return defaultPath;
  }
  
  return null;
}
