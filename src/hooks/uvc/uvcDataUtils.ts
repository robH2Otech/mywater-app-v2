
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUVCStatus } from "@/utils/uvcStatusUtils";
import { determineUnitStatus } from "@/utils/unitStatusUtils";
import { UnitWithUVC } from "./useUVCData";
import { getMeasurementsCollectionPath } from "@/hooks/measurements/useMeasurementCollection";
import { fetchLatestMeasurement } from "./measurementUtils";
import { calculateTotalUVCHours } from "./uvcHoursUtils";
import { processUnitBaseData } from "./unitDataUtils";

/**
 * Processes UVC hours for a unit, calculating total hours based on base and measurement data
 */
export async function processUnitUVCData(unitDoc: any): Promise<UnitWithUVC> {
  // Process the basic unit data
  const { id: unitId, unitData, baseUvcHours, totalVolume } = processUnitBaseData(unitDoc);
  
  // Skip processing for non-UVC units that don't have any UVC hours
  if (unitData.unit_type !== 'uvc' && !baseUvcHours && !unitData.uvc_hours && !unitData.uvc_status) {
    return {
      id: unitId,
      ...unitData,
      uvc_hours: 0,
      uvc_status: 'active',
      is_uvc_accumulated: false,
      total_volume: totalVolume
    };
  }
  
  // If the unit already has accumulated UVC hours, just use those
  if (unitData.is_uvc_accumulated) {
    console.log(`Unit ${unitId} - Using accumulated hours (${baseUvcHours}), not fetching measurements`);
    
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
    // Get the latest measurement data
    const measurementData = await fetchLatestMeasurement(unitId);
    
    // Calculate total UVC hours
    const totalUvcHours = calculateTotalUVCHours(
      baseUvcHours, 
      measurementData, 
      unitData.is_uvc_accumulated
    );
    
    console.log(`Unit ${unitId} - Final calculated UVC hours: ${totalUvcHours}`);
    
    // Calculate the UVC status based on total hours
    const uvcStatus = determineUVCStatus(totalUvcHours);
    
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
