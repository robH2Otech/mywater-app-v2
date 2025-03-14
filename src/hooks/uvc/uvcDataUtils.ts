
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUVCStatus } from "@/utils/uvcStatusUtils";
import { determineUnitStatus } from "@/utils/unitStatusUtils";
import { UnitWithUVC } from "./useUVCData";

/**
 * Processes UVC hours for a unit, calculating total hours based on base and measurement data
 */
export async function processUnitUVCData(unitDoc: any): Promise<UnitWithUVC> {
  const unitData = unitDoc.data();
  const unitId = unitDoc.id;
  
  console.log(`Processing unit ${unitId} (${unitData.name})`);
  
  // Get base UVC hours from unit document
  let baseUvcHours = unitData.uvc_hours;
  if (typeof baseUvcHours === 'string') {
    baseUvcHours = parseFloat(baseUvcHours);
  } else if (baseUvcHours === undefined || baseUvcHours === null) {
    baseUvcHours = 0;
  }
  
  console.log(`Unit ${unitId} - Base UVC hours from database: ${baseUvcHours}`);
  console.log(`Unit ${unitId} - is_uvc_accumulated flag: ${unitData.is_uvc_accumulated}`);
  
  // Get latest measurement data for this unit
  const measurementData = await fetchLatestMeasurement(unitId);
  let totalUvcHours = calculateTotalUVCHours(baseUvcHours, measurementData, unitData.is_uvc_accumulated);
  
  // Calculate the correct status based on total UVC hours
  const uvcStatus = determineUVCStatus(totalUvcHours);
  
  // Ensure total_volume is a number
  let totalVolume = unitData.total_volume;
  if (typeof totalVolume === 'string') {
    totalVolume = parseFloat(totalVolume);
  } else if (totalVolume === undefined || totalVolume === null) {
    totalVolume = 0;
  }
  
  // Calculate the correct filter status based on volume
  const filterStatus = determineUnitStatus(totalVolume);
  
  console.log(`Unit ${unitId} Final UVC hours: Base ${baseUvcHours} + Latest ${measurementData.hasMeasurementData && !unitData.is_uvc_accumulated ? measurementData.latestMeasurementUvcHours : 0} = Total ${totalUvcHours} (status: ${uvcStatus})`);
  
  return {
    id: unitId,
    ...unitData,
    // Always use calculated statuses
    status: filterStatus,
    uvc_status: uvcStatus,
    // Use total UVC hours
    uvc_hours: totalUvcHours,
    // Add flag to track whether hours are accumulated
    is_uvc_accumulated: unitData.is_uvc_accumulated || false,
    // Ensure total_volume is a number
    total_volume: totalVolume
  };
}

/**
 * Fetches the latest measurement for a unit
 */
async function fetchLatestMeasurement(unitId: string): Promise<{ 
  latestMeasurementUvcHours: number;
  hasMeasurementData: boolean;
}> {
  let latestMeasurementUvcHours = 0;
  let hasMeasurementData = false;
  
  try {
    const measurementsQuery = query(
      collection(db, "measurements"),
      where("unit_id", "==", unitId),
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

/**
 * Calculates total UVC hours based on base hours, measurement data, and accumulation flag
 */
function calculateTotalUVCHours(
  baseUvcHours: number, 
  measurementData: { latestMeasurementUvcHours: number; hasMeasurementData: boolean },
  isUvcAccumulated?: boolean
): number {
  let totalUvcHours = baseUvcHours;
  
  // If we have measurement data, add it to the base UVC hours, but only if the
  // unit is not already using accumulated values
  if (measurementData.hasMeasurementData && !isUvcAccumulated) {
    totalUvcHours += measurementData.latestMeasurementUvcHours;
    console.log(`Adding measurement hours to base: ${baseUvcHours} + ${measurementData.latestMeasurementUvcHours} = ${totalUvcHours}`);
  } else if (isUvcAccumulated) {
    console.log(`Using accumulated hours (${baseUvcHours}), not adding measurement hours`);
  }
  
  return totalUvcHours;
}
