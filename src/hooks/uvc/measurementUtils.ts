
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { tryAllMeasurementPaths } from "@/hooks/measurements/utils/collectionPaths";

/**
 * Fetches the latest measurement data for a unit with improved reliability for all unit types
 */
export async function fetchLatestMeasurement(unitId: string): Promise<{
  latestMeasurementUvcHours: number;
  hasMeasurementData: boolean;
  timestamp?: string;
  volume?: number;
}> {
  try {
    console.log(`🔍 Fetching latest measurement for unit ${unitId}`);
    
    // Special handling for X-WATER and MYWATER units
    const isSpecialUnit = unitId.startsWith("MYWATER_") || unitId.startsWith("X-WATER");
    
    if (isSpecialUnit) {
      console.log(`📊 ${unitId} is a special unit (MYWATER/X-WATER), using priority path`);
    }
    
    // Try all paths to find data
    const snapshot = await tryAllMeasurementPaths(unitId, 1);
    
    if (snapshot && !snapshot.empty) {
      const latestMeasurement = snapshot.docs[0].data();
      console.log(`📊 Latest measurement raw data for unit ${unitId}:`, {
        uvc_hours: latestMeasurement.uvc_hours,
        volume: latestMeasurement.volume || latestMeasurement.total_volume || latestMeasurement.cumulative_volume,
        timestamp: latestMeasurement.timestamp,
        allFields: Object.keys(latestMeasurement)
      });
      
      // Extract UVC hours with multiple fallback fields
      let uvcHours = 0;
      
      // Try different field names that might contain UVC hours
      if (latestMeasurement.uvc_hours !== undefined && latestMeasurement.uvc_hours !== null) {
        uvcHours = typeof latestMeasurement.uvc_hours === 'string' 
          ? parseFloat(latestMeasurement.uvc_hours) 
          : (latestMeasurement.uvc_hours || 0);
      } else if (latestMeasurement.uvc !== undefined && latestMeasurement.uvc !== null) {
        uvcHours = typeof latestMeasurement.uvc === 'string'
          ? parseFloat(latestMeasurement.uvc)
          : (latestMeasurement.uvc || 0);
      } else if (latestMeasurement.uvc_time !== undefined && latestMeasurement.uvc_time !== null) {
        uvcHours = typeof latestMeasurement.uvc_time === 'string'
          ? parseFloat(latestMeasurement.uvc_time)
          : (latestMeasurement.uvc_time || 0);
      }
      
      console.log(`📊 Extracted UVC hours for unit ${unitId}: ${uvcHours}`);
      
      // Extract volume with multiple fallback fields
      let volume = undefined;
      if (latestMeasurement.volume !== undefined) {
        volume = typeof latestMeasurement.volume === 'string'
          ? parseFloat(latestMeasurement.volume)
          : latestMeasurement.volume;
      } else if (latestMeasurement.total_volume !== undefined) {
        volume = typeof latestMeasurement.total_volume === 'string'
          ? parseFloat(latestMeasurement.total_volume)
          : latestMeasurement.total_volume;
      } else if (latestMeasurement.cumulative_volume !== undefined) {
        volume = typeof latestMeasurement.cumulative_volume === 'string'
          ? parseFloat(latestMeasurement.cumulative_volume)
          : latestMeasurement.cumulative_volume;
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
    
    console.log(`❌ No measurement data found for unit ${unitId} after trying all paths`);
    return {
      latestMeasurementUvcHours: 0,
      hasMeasurementData: false
    };
  } catch (error) {
    console.error(`❌ Error fetching latest measurement for unit ${unitId}:`, error);
    return {
      latestMeasurementUvcHours: 0,
      hasMeasurementData: false
    };
  }
}
