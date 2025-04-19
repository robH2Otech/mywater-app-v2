
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { getMeasurementsCollectionPath } from "@/hooks/measurements/useMeasurementCollection";

/**
 * Fetches the latest measurement data for a unit
 */
export async function fetchLatestMeasurement(unitId: string): Promise<{
  latestMeasurementUvcHours: number;
  hasMeasurementData: boolean;
}> {
  try {
    console.log(`Fetching latest measurement for unit ${unitId}`);
    
    // Use the correct measurements collection path based on unit ID
    const collectionPath = getMeasurementsCollectionPath(unitId);
    
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
      if (latestMeasurement.uvc_hours !== undefined) {
        const uvcHours = typeof latestMeasurement.uvc_hours === 'string' 
          ? parseFloat(latestMeasurement.uvc_hours) 
          : (latestMeasurement.uvc_hours || 0);
          
        console.log(`Latest UVC hours for unit ${unitId}: ${uvcHours}`);
        return {
          latestMeasurementUvcHours: uvcHours,
          hasMeasurementData: true
        };
      }
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
