
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

  // For special units (MYWATER and X-WATER), try the preferred paths first
  const isSpecialUnit = unitId.startsWith("MYWATER_") || unitId.startsWith("X-WATER");
  let pathsToTry = [...MEASUREMENT_PATHS];
  
  if (isSpecialUnit) {
    // For special units, always prioritize this path as it's the most reliable
    const specialPriorityPath = "units/{unitId}/data";
    
    // Remove this path from the original array to avoid duplicates
    pathsToTry = pathsToTry.filter(path => path !== specialPriorityPath);
    
    // Add priority path at the beginning
    pathsToTry = [specialPriorityPath, ...pathsToTry];
    console.log(`Special unit detected (${unitId}). Prioritizing path: ${specialPriorityPath}`);
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
        const testDoc = snapshot.docs[0].data();
        console.log(`✅ Found valid path with data: ${path} for unit ${unitId}`, {
          hasUvcHours: testDoc.uvc_hours !== undefined,
          hasVolume: testDoc.volume !== undefined || testDoc.total_volume !== undefined,
          sampleData: {
            uvc_hours: testDoc.uvc_hours,
            volume: testDoc.volume || testDoc.total_volume,
            timestamp: testDoc.timestamp
          }
        });
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
  
  // For special units, default to units/{unitId}/data even if empty
  if (isSpecialUnit) {
    const defaultPath = `units/${unitId}/data`;
    console.log(`Using default path for special unit: ${defaultPath}`);
    successfulPathsCache.set(unitId, defaultPath);
    return defaultPath;
  }
  
  return null;
}
