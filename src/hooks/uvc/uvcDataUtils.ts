
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUVCStatus } from "@/utils/uvcStatusUtils";
import { determineUnitStatus } from "@/utils/unitStatusUtils";
import { UnitWithUVC } from "./useUVCData";
import { getMeasurementsCollectionPath } from "@/hooks/measurements/useMeasurementCollection";

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
  
  // If the unit already has accumulated UVC hours, just use those
  if (unitData.is_uvc_accumulated) {
    console.log(`Unit ${unitId} - Using accumulated hours (${baseUvcHours}), not fetching measurements`);
    
    // Ensure total_volume is a number
    let totalVolume = unitData.total_volume;
    if (typeof totalVolume === 'string') {
      totalVolume = parseFloat(totalVolume);
    } else if (totalVolume === undefined || totalVolume === null) {
      totalVolume = 0;
    }
    
    // Calculate the correct filter status based on volume
    const filterStatus = determineUnitStatus(totalVolume);
    
    // Calculate the UVC status based on accumulated hours
    const uvcStatus = determineUVCStatus(baseUvcHours);
    
    return {
      id: unitId,
      ...unitData,
      status: filterStatus,
      uvc_status: uvcStatus,
      uvc_hours: baseUvcHours,
      is_uvc_accumulated: true,
      total_volume: totalVolume
    };
  }
  
  // Unit does not have accumulated hours, so fetch the latest measurements
  // Use the correct collection path based on unit ID
  const collectionPath = getMeasurementsCollectionPath(unitId);
  console.log(`Unit ${unitId} - Fetching measurements from: ${collectionPath}`);
  
  try {
    // First check if we should use the measurements collection
    const measurementsQuery = query(
      collection(db, collectionPath),
      orderBy("timestamp", "desc"),
      limit(1)
    );
    
    const measurementsSnapshot = await getDocs(measurementsQuery);
    
    let latestMeasurementUvcHours = 0;
    let hasMeasurementData = false;
    
    if (!measurementsSnapshot.empty) {
      const latestMeasurement = measurementsSnapshot.docs[0].data();
      
      if (latestMeasurement.uvc_hours !== undefined) {
        latestMeasurementUvcHours = typeof latestMeasurement.uvc_hours === 'string' 
          ? parseFloat(latestMeasurement.uvc_hours) 
          : (latestMeasurement.uvc_hours || 0);
        
        hasMeasurementData = true;
        console.log(`Unit ${unitId} - Latest measurement UVC hours: ${latestMeasurementUvcHours}`);
      } else {
        console.log(`Unit ${unitId} - Latest measurement has no UVC hours data`);
      }
    } else {
      console.log(`Unit ${unitId} - No measurements found in collection: ${collectionPath}`);
    }
    
    // Calculate total UVC hours
    let totalUvcHours = baseUvcHours;
    if (hasMeasurementData) {
      totalUvcHours += latestMeasurementUvcHours;
      console.log(`Unit ${unitId} - Final calculated UVC hours: ${baseUvcHours} + ${latestMeasurementUvcHours} = ${totalUvcHours}`);
    } else {
      console.log(`Unit ${unitId} - Using only base UVC hours: ${baseUvcHours}`);
    }
    
    // Calculate the UVC status based on total hours
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
  } catch (error) {
    console.error(`Error processing UVC data for unit ${unitId}:`, error);
    
    // Return basic unit data with what we have
    return {
      id: unitId,
      ...unitData,
      uvc_hours: baseUvcHours,
      uvc_status: determineUVCStatus(baseUvcHours),
      is_uvc_accumulated: unitData.is_uvc_accumulated || false
    };
  }
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
