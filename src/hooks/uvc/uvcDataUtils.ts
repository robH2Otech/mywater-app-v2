
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
  
  // Skip processing for non-UVC units that don't have any UVC hours
  if (!isUVCUnit && !baseUvcHours && !unitData.uvc_hours && !unitData.uvc_status) {
    return {
      id: unitId,
      ...unitData,
      uvc_hours: 0,
      uvc_status: 'active',
      is_uvc_accumulated: false,
      total_volume: totalVolume
    };
  }
  
  console.log(`🔧 Processing UVC data for unit ${unitId} (Special: ${isSpecialUnit}, UVC: ${isUVCUnit})`);
  
  // If we don't have preloaded measurement data, get it now
  const measurementData = preloadedMeasurementData || await fetchLatestMeasurement(unitId);
  
  try {
    // For X-WATER and MYWATER units, prioritize measurement data for accurate UVC hours
    let totalUvcHours = baseUvcHours;
    let shouldUseMeasurementData = false;
    
    if (measurementData.hasMeasurementData && measurementData.latestMeasurementUvcHours > 0) {
      console.log(`📊 Unit ${unitId} - Measurement UVC hours: ${measurementData.latestMeasurementUvcHours}, Base UVC hours: ${baseUvcHours}`);
      
      // For special units or when base hours are 0, use measurement directly
      if (isSpecialUnit || baseUvcHours === 0) {
        totalUvcHours = measurementData.latestMeasurementUvcHours;
        shouldUseMeasurementData = true;
        console.log(`✅ Unit ${unitId} - Using measurement data directly: ${totalUvcHours} hours`);
      } 
      // For other units, use the accumulated flag to determine behavior
      else if (!unitData.is_uvc_accumulated) {
        totalUvcHours += measurementData.latestMeasurementUvcHours;
        console.log(`📈 Unit ${unitId} - Adding measurement to base: ${baseUvcHours} + ${measurementData.latestMeasurementUvcHours} = ${totalUvcHours} hours`);
      } else {
        console.log(`📊 Unit ${unitId} - Using accumulated base hours: ${totalUvcHours} hours`);
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
