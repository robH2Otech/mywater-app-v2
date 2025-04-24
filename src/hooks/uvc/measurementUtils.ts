
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { MEASUREMENT_PATHS, tryAllMeasurementPaths } from "@/hooks/measurements/utils/collectionPaths";

/**
 * Fetches the latest measurement data for a unit with improved reliability
 */
export async function fetchLatestMeasurement(unitId: string): Promise<{
  latestMeasurementUvcHours: number;
  hasMeasurementData: boolean;
  timestamp?: string;
  volume?: number;
}> {
  try {
    console.log(`Fetching latest measurement for unit ${unitId}`);
    
    // Try all paths to find data
    const snapshot = await tryAllMeasurementPaths(unitId, 1);
    
    if (snapshot && !snapshot.empty) {
      const latestMeasurement = snapshot.docs[0].data();
      console.log(`Latest measurement for unit ${unitId} found:`, latestMeasurement);
      
      // Extract UVC hours from the measurement
      let uvcHours = 0;
      if (latestMeasurement.uvc_hours !== undefined) {
        uvcHours = typeof latestMeasurement.uvc_hours === 'string' 
          ? parseFloat(latestMeasurement.uvc_hours) 
          : (latestMeasurement.uvc_hours || 0);
          
        console.log(`Latest UVC hours for unit ${unitId}: ${uvcHours}`);
      }
      
      // Extract volume if available
      let volume = undefined;
      if (latestMeasurement.volume !== undefined) {
        volume = typeof latestMeasurement.volume === 'string'
          ? parseFloat(latestMeasurement.volume)
          : latestMeasurement.volume;
      } else if (latestMeasurement.total_volume !== undefined) {
        volume = typeof latestMeasurement.total_volume === 'string'
          ? parseFloat(latestMeasurement.total_volume)
          : latestMeasurement.total_volume;
      }
      
      // Get the timestamp
      let timestamp = null;
      if (latestMeasurement.timestamp) {
        // Handle both Firebase timestamp objects and string timestamps
        if (typeof latestMeasurement.timestamp === 'object' && latestMeasurement.timestamp.toDate) {
          timestamp = latestMeasurement.timestamp.toDate().toISOString();
        } else if (latestMeasurement.timestamp instanceof Date) {
          timestamp = latestMeasurement.timestamp.toISOString();
        } else {
          timestamp = latestMeasurement.timestamp;
        }
      }
      
      return {
        latestMeasurementUvcHours: uvcHours,
        hasMeasurementData: true,
        timestamp: timestamp,
        volume
      };
    }
    
    console.log(`No measurement data found for unit ${unitId} after trying all paths`);
    return {
      latestMeasurementUvcHours: 0,
      hasMeasurementData: false
    };
  } catch (error) {
    console.error(`Error fetching latest measurement for unit ${unitId}:`, error);
    return {
      latestMeasurementUvcHours: 0,
      hasMeasurementData: false
    };
  }
}
