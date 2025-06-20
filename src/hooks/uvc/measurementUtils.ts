
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { tryAllMeasurementPaths } from "@/hooks/measurements/utils/collectionPaths";

/**
 * Fetches the latest measurement data for a unit with improved UVC hours extraction
 */
export async function fetchLatestMeasurement(unitId: string): Promise<{
  latestMeasurementUvcHours: number;
  hasMeasurementData: boolean;
  timestamp?: string;
  volume?: number;
}> {
  try {
    console.log(`🔍 Fetching latest measurement for unit ${unitId}`);
    
    // Try all paths to find data
    const snapshot = await tryAllMeasurementPaths(unitId, 1);
    
    if (snapshot && !snapshot.empty) {
      const latestMeasurement = snapshot.docs[0].data();
      console.log(`📊 Latest measurement raw data for unit ${unitId}:`, {
        uvc_hours: latestMeasurement.uvc_hours,
        uvc: latestMeasurement.uvc,
        uvc_time: latestMeasurement.uvc_time,
        volume: latestMeasurement.volume || latestMeasurement.total_volume || latestMeasurement.cumulative_volume,
        timestamp: latestMeasurement.timestamp,
        allFields: Object.keys(latestMeasurement)
      });
      
      // Extract UVC hours with multiple fallback fields and better parsing
      let uvcHours = 0;
      
      // Try different field names that might contain UVC hours
      const possibleUvcFields = ['uvc_hours', 'uvc', 'uvc_time', 'uvchours', 'uvcTime'];
      
      for (const field of possibleUvcFields) {
        if (latestMeasurement[field] !== undefined && latestMeasurement[field] !== null) {
          const value = latestMeasurement[field];
          
          if (typeof value === 'string') {
            const parsedValue = parseFloat(value);
            if (!isNaN(parsedValue) && parsedValue > 0) {
              uvcHours = parsedValue;
              console.log(`📊 Found UVC hours in field '${field}' for unit ${unitId}: ${uvcHours}`);
              break;
            }
          } else if (typeof value === 'number' && value > 0) {
            uvcHours = value;
            console.log(`📊 Found UVC hours in field '${field}' for unit ${unitId}: ${uvcHours}`);
            break;
          }
        }
      }
      
      // If no UVC hours found in standard fields, log warning
      if (uvcHours === 0) {
        console.warn(`⚠️ No valid UVC hours found in any field for unit ${unitId}. Available fields:`, Object.keys(latestMeasurement));
      }
      
      // Extract volume with multiple fallback fields
      let volume = undefined;
      const possibleVolumeFields = ['volume', 'total_volume', 'cumulative_volume'];
      
      for (const field of possibleVolumeFields) {
        if (latestMeasurement[field] !== undefined) {
          const value = latestMeasurement[field];
          
          if (typeof value === 'string') {
            const parsedValue = parseFloat(value);
            if (!isNaN(parsedValue)) {
              volume = parsedValue;
              break;
            }
          } else if (typeof value === 'number') {
            volume = value;
            break;
          }
        }
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
      
      console.log(`📊 Extracted data for unit ${unitId} - UVC Hours: ${uvcHours}, Volume: ${volume}, Has Data: ${uvcHours > 0}`);
      
      return {
        latestMeasurementUvcHours: uvcHours,
        hasMeasurementData: uvcHours > 0, // Only consider it valid data if we have UVC hours
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
