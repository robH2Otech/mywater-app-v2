
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { formatThousands } from "./formatUtils";

/**
 * Fetches all unit total volumes directly from their documents
 */
export async function fetchUnitTotalVolumes(unitIds: string[]): Promise<number> {
  try {
    if (!unitIds || unitIds.length === 0) {
      return 0;
    }
    
    let totalVolume = 0;
    
    // Fetch all units in parallel
    const unitPromises = unitIds.map(unitId => getDoc(doc(db, "units", unitId)));
    const unitDocs = await Promise.all(unitPromises);
    
    // Calculate the sum of all total_volume fields
    unitDocs.forEach(unitDoc => {
      if (unitDoc.exists()) {
        const unitData = unitDoc.data();
        const unitVolume = typeof unitData.total_volume === 'number' 
          ? unitData.total_volume 
          : typeof unitData.total_volume === 'string'
            ? parseFloat(unitData.total_volume)
            : 0;
            
        // Ensure we're adding a valid number - prevent extremely large values
        if (!isNaN(unitVolume) && isFinite(unitVolume) && unitVolume < 1000000) {
          totalVolume += unitVolume;
        } else {
          console.warn(`Invalid volume value detected for unit ${unitDoc.id}: ${unitVolume}`);
        }
      }
    });
    
    return totalVolume;
  } catch (err) {
    console.error("Error fetching unit total volumes:", err);
    return 0;
  }
}

/**
 * Gets the most recent volume data for display
 * This is a more aggressive approach to getting the latest data
 */
export async function getLatestVolumeData(unitIds: string[]): Promise<number> {
  // First try the regular method
  const totalVolume = await fetchUnitTotalVolumes(unitIds);
  
  // If we got data, return it
  if (totalVolume > 0) {
    return totalVolume;
  }
  
  // Otherwise, implement fallback mechanism (can be expanded later)
  return 0;
}

/**
 * Format volume for display with proper units
 * Ensures the number isn't too large and adds appropriate formatting
 */
export function formatTotalVolume(volume: number | undefined | null): string {
  if (volume === undefined || volume === null || isNaN(volume) || !isFinite(volume)) {
    return "0";
  }
  
  // Cap maximum display value to prevent unrealistic numbers
  const cappedVolume = Math.min(volume, 999999);
  
  // Format with appropriate decimal places - For large numbers, don't show decimal places
  if (cappedVolume >= 1000) {
    return formatThousands(Math.floor(cappedVolume));
  } else {
    // For smaller numbers, show up to 2 decimal places, but only if needed
    return formatThousands(parseFloat(cappedVolume.toFixed(2)));
  }
}
