
import { determineUVCStatus } from "@/utils/uvcStatusUtils";
import { determineUnitStatus } from "@/utils/unitStatusUtils";
import { UnitWithUVC } from "./useUVCData";
import { fetchLatestMeasurement } from "./measurementUtils";
import { calculateTotalUVCHours } from "./uvcHoursUtils";
import { processUnitBaseData } from "./unitDataUtils";

/**
 * Processes UVC hours for a unit, calculating total hours based on base and measurement data
 */
export async function processUnitUVCData(
  unitDoc: any, 
  preloadedMeasurementData?: any
): Promise<UnitWithUVC> {
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
  
  // If we don't have preloaded measurement data, get it now
  const measurementData = preloadedMeasurementData || await fetchLatestMeasurement(unitId);
  
  try {
    // IMPORTANT CHANGE: We should always prioritize measurement data for the latest UVC hours,
    // regardless of the is_uvc_accumulated flag
    let totalUvcHours = baseUvcHours;
    
    // If we have measurement data, we should use that as the latest value instead of the base value
    if (measurementData.hasMeasurementData && measurementData.latestMeasurementUvcHours > 0) {
      // Use the measurement value directly as it's more current
      totalUvcHours = measurementData.latestMeasurementUvcHours;
      console.log(`Unit ${unitId} - Using direct measurement UVC hours: ${totalUvcHours}`);
    } else {
      console.log(`Unit ${unitId} - Using base UVC hours: ${totalUvcHours}`);
    }
    
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
      total_volume: totalVolume,
      // Include measurement timestamp for display
      latest_measurement_timestamp: measurementData.timestamp
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
