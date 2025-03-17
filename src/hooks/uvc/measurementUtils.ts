
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { getMeasurementsCollectionPath } from "@/hooks/measurements/useMeasurementCollection";
import { Measurement } from "@/utils/measurements/types";

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
      const latestMeasurementData = measurementsSnapshot.docs[0].data();
      if (latestMeasurementData.uvc_hours !== undefined) {
        latestMeasurementUvcHours = typeof latestMeasurementData.uvc_hours === 'string' 
          ? parseFloat(latestMeasurementData.uvc_hours) 
          : (latestMeasurementData.uvc_hours || 0);
        hasMeasurementData = true;
        
        console.log(`Unit ${unitId} - Latest measurement UVC hours: ${latestMeasurementUvcHours}`);
      }
    }
  } catch (measurementError) {
    console.error(`Error fetching measurements for unit ${unitId}:`, measurementError);
  }
  
  return { latestMeasurementUvcHours, hasMeasurementData };
}
