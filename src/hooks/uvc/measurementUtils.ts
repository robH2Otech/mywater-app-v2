import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { getMeasurementsCollectionPath } from "@/hooks/measurements/useMeasurementCollection";

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
    
    // Use the correct measurements collection path based on unit ID
    const collectionPath = getMeasurementsCollectionPath(unitId);
    console.log(`Using collection path: ${collectionPath} for unit ${unitId}`);
    
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
      console.log(`Latest measurement for unit ${unitId}:`, latestMeasurement);
      
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
      }
      
      return {
        latestMeasurementUvcHours: uvcHours,
        hasMeasurementData: true,
        timestamp: latestMeasurement.timestamp,
        volume
      };
    }
    
    console.log(`No measurement data found for unit ${unitId} in collection: ${collectionPath}`);
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

/**
 * Fetches the latest cumulative UVC hours for a unit
 * This includes both the base value and any additional hours from measurements
 */
export async function fetchCumulativeUVCHours(
  unitId: string,
  baseHours: number = 0,
  isAccumulated: boolean = false
): Promise<number> {
  try {
    // If already using accumulated hours, just return the base hours
    if (isAccumulated) {
      return baseHours;
    }
    
    // Otherwise, fetch and add the latest measurement hours
    const { latestMeasurementUvcHours, hasMeasurementData } = await fetchLatestMeasurement(unitId);
    
    if (hasMeasurementData) {
      return baseHours + latestMeasurementUvcHours;
    }
    
    // If no measurements, return the base hours
    return baseHours;
  } catch (error) {
    console.error(`Error calculating cumulative UVC hours for unit ${unitId}:`, error);
    return baseHours;
  }
}
