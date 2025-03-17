
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { getMeasurementsCollectionPath } from "@/hooks/measurements/useMeasurementCollection";

/**
 * Fetches the latest measurement for a unit
 */
export async function fetchLatestMeasurement(unitId: string): Promise<{ 
  latestMeasurementUvcHours: number;
  hasMeasurementData: boolean;
}> {
  let latestMeasurementUvcHours = 0;
  let hasMeasurementData = false;
  
  try {
    // Use the correct collection path based on unit ID
    const collectionPath = getMeasurementsCollectionPath(unitId);
    
    const measurementsQuery = query(
      collection(db, collectionPath),
      orderBy("timestamp", "desc"),
      limit(1)
    );
    
    const measurementsSnapshot = await getDocs(measurementsQuery);
    
    if (!measurementsSnapshot.empty) {
      const latestMeasurement = measurementsSnapshot.docs[0].data();
      if (latestMeasurement.uvc_hours !== undefined) {
        latestMeasurementUvcHours = typeof latestMeasurement.uvc_hours === 'string' 
          ? parseFloat(latestMeasurement.uvc_hours) 
          : (latestMeasurement.uvc_hours || 0);
        hasMeasurementData = true;
        
        console.log(`Unit ${unitId} - Latest measurement UVC hours: ${latestMeasurementUvcHours}`);
      }
    }
  } catch (measurementError) {
    console.error(`Error fetching measurements for unit ${unitId}:`, measurementError);
  }
  
  return { latestMeasurementUvcHours, hasMeasurementData };
}
