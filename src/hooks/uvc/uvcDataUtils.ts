
import { determineUVCStatus } from "@/utils/uvcStatusUtils";
import { determineUnitStatus } from "@/utils/unitStatusUtils";
import { UnitWithUVC } from "./useUVCData";
import { fetchLatestMeasurement } from "./measurementUtils";
import { processUnitBaseData } from "./unitDataUtils";

/**
 * Processes UVC hours for a unit, prioritizing measurement data for accurate display
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
    // For UVC display, we want to use the most current data from measurements
    let finalUvcHours = baseUvcHours;
    let shouldUseMeasurementData = false;
    
    if (measurementData.hasMeasurementData && measurementData.latestMeasurementUvcHours > 0) {
      console.log(`📊 Unit ${unitId} - Found valid measurement data:`, {
        measurementUvcHours: measurementData.latestMeasurementUvcHours,
        baseUvcHours: baseUvcHours,
        isSpecialUnit: isSpecialUnit
      });
      
      // For ALL UVC units (including special units), ALWAYS use measurement data 
      // as it represents the current real-time state from the device
      finalUvcHours = measurementData.latestMeasurementUvcHours;
      shouldUseMeasurementData = true;
      
      console.log(`✅ Unit ${unitId} - Using measurement data directly: ${finalUvcHours} hours (was ${baseUvcHours})`);
    } else {
      console.log(`⚠️ Unit ${unitId} - No valid measurement data, using base hours: ${finalUvcHours}`);
    }
    
    console.log(`🎯 Unit ${unitId} - Final UVC hours for display: ${finalUvcHours}`);
    
    // Calculate the UVC status based on final hours
    const uvcStatus = determineUVCStatus(finalUvcHours);
    
    // Calculate the correct filter status based on volume
    const filterStatus = determineUnitStatus(totalVolume);
    
    return {
      id: unitId,
      ...unitData,
      // Always use calculated statuses
      status: filterStatus,
      uvc_status: uvcStatus,
      // Use final UVC hours (prioritizing measurement data)
      uvc_hours: finalUvcHours,
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
