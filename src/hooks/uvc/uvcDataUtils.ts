
import { determineUVCStatus } from "@/utils/uvcStatusUtils";
import { determineUnitStatus } from "@/utils/unitStatusUtils";
import { UnitWithUVC } from "./useUVCData";
import { fetchLatestMeasurement } from "./measurementUtils";
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
  
  // Check if this is a special unit type that should always be processed
  const isSpecialUnit = unitId.startsWith("MYWATER_") || unitId.startsWith("X-WATER");
  const isUVCUnit = unitData.unit_type === 'uvc' || isSpecialUnit;
  
  console.log(`🔧 Processing UVC data for unit ${unitId} (Special: ${isSpecialUnit}, UVC: ${isUVCUnit}, BaseHours: ${baseUvcHours})`);
  
  // If we don't have preloaded measurement data, get it now
  const measurementData = preloadedMeasurementData || await fetchLatestMeasurement(unitId);
  
  try {
    // Initialize with base UVC hours
    let totalUvcHours = baseUvcHours;
    let shouldUseMeasurementData = false;
    
    if (measurementData.hasMeasurementData && measurementData.latestMeasurementUvcHours > 0) {
      console.log(`📊 Unit ${unitId} - Found measurement data:`, {
        measurementUvcHours: measurementData.latestMeasurementUvcHours,
        baseUvcHours: baseUvcHours,
        isSpecialUnit: isSpecialUnit,
        isAccumulated: unitData.is_uvc_accumulated
      });
      
      // For special units (X-WATER, MYWATER), always use measurement data directly
      // as it represents the current state from the device
      if (isSpecialUnit) {
        totalUvcHours = measurementData.latestMeasurementUvcHours;
        shouldUseMeasurementData = true;
        console.log(`✅ Unit ${unitId} - Using measurement data directly (special unit): ${totalUvcHours} hours`);
      } 
      // For other UVC units, check if data has been accumulated
      else if (!unitData.is_uvc_accumulated && measurementData.latestMeasurementUvcHours > baseUvcHours) {
        // If measurement hours are greater than base, use measurement directly
        totalUvcHours = measurementData.latestMeasurementUvcHours;
        shouldUseMeasurementData = true;
        console.log(`✅ Unit ${unitId} - Using measurement data (higher than base): ${totalUvcHours} hours`);
      }
      else {
        console.log(`📊 Unit ${unitId} - Using base UVC hours (accumulated or lower measurement): ${totalUvcHours} hours`);
      }
    } else {
      console.log(`⚠️ Unit ${unitId} - No valid measurement data, using base hours: ${totalUvcHours}`);
    }
    
    console.log(`🎯 Unit ${unitId} - Final calculated UVC hours: ${totalUvcHours}`);
    
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
      // Update accumulated flag if we used measurement data
      is_uvc_accumulated: shouldUseMeasurementData ? true : (unitData.is_uvc_accumulated || false),
      // Ensure total_volume is a number
      total_volume: totalVolume,
      // Include measurement timestamp for display
      latest_measurement_timestamp: measurementData.timestamp
    };
  } catch (error) {
    console.error(`❌ Error processing UVC data for unit ${unitId}:`, error);
    
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
