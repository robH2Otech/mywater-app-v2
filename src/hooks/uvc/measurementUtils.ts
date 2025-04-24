
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { getMeasurementsCollectionPath } from "@/hooks/measurements/useMeasurementCollection";

// Array of possible measurement collection paths to try for each unit
const MEASUREMENT_PATHS = [
  "units/{unitId}/measurements",
  "units/{unitId}/data",
  "measurements/{unitId}/data",
  "device-data/{unitId}/measurements"
];

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
    
    // Try each path until we find data
    for (const pathTemplate of MEASUREMENT_PATHS) {
      const collectionPath = pathTemplate.replace('{unitId}', unitId);
      console.log(`Trying collection path: ${collectionPath} for unit ${unitId}`);
      
      try {
        // Query the latest measurement
        const measurementsQuery = query(
          collection(db, collectionPath),
          orderBy("timestamp", "desc"),
          limit(1)
        );
        
        const measurementsSnapshot = await getDocs(measurementsQuery);
        
        // Check if we found any measurements
        if (!measurementsSnapshot.empty) {
          const latestMeasurement = measurementsSnapshot.docs[0].data();
          console.log(`Latest measurement for unit ${unitId} found in path ${collectionPath}:`, latestMeasurement);
          
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
      } catch (err) {
        console.warn(`Error trying path ${collectionPath} for unit ${unitId}:`, err);
        // Continue to next path
      }
    }
    
    // Special case for MYWATER_003 - check if your collection path is different
    if (unitId === "MYWATER_003") {
      const specialPath = `units/MYWATER_003/measurements`;
      console.log(`Trying special path for MYWATER_003: ${specialPath}`);
      
      try {
        const specialQuery = query(
          collection(db, specialPath),
          orderBy("timestamp", "desc"),
          limit(1)
        );
        
        const specialSnapshot = await getDocs(specialQuery);
        
        if (!specialSnapshot.empty) {
          const latestMeasurement = specialSnapshot.docs[0].data();
          
          let uvcHours = 0;
          if (latestMeasurement.uvc_hours !== undefined) {
            uvcHours = typeof latestMeasurement.uvc_hours === 'string' 
              ? parseFloat(latestMeasurement.uvc_hours) 
              : (latestMeasurement.uvc_hours || 0);
          }
          
          let timestamp = null;
          if (latestMeasurement.timestamp) {
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
            timestamp
          };
        }
      } catch (err) {
        console.warn(`Error trying special path for MYWATER_003:`, err);
      }
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
