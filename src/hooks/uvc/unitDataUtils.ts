
import { normalizeUVCHours } from "./uvcHoursUtils";
import { determineUnitStatus } from "@/utils/unitStatusUtils";

/**
 * Processes the basic data from a unit document
 */
export function processUnitBaseData(unitDoc: any): {
  id: string;
  unitData: any;
  baseUvcHours: number;
  totalVolume: number;
} {
  const unitData = unitDoc.data();
  const unitId = unitDoc.id;
  
  console.log(`Processing unit ${unitId} (${unitData.name})`);
  
  // Get base UVC hours from unit document
  const baseUvcHours = normalizeUVCHours(unitData.uvc_hours);
  
  console.log(`Unit ${unitId} - Base UVC hours from database: ${baseUvcHours}`);
  console.log(`Unit ${unitId} - is_uvc_accumulated flag: ${unitData.is_uvc_accumulated}`);
  
  // Ensure total_volume is a number
  let totalVolume = unitData.total_volume;
  if (typeof totalVolume === 'string') {
    totalVolume = parseFloat(totalVolume);
  } else if (totalVolume === undefined || totalVolume === null) {
    totalVolume = 0;
  }
  
  return {
    id: unitId,
    unitData,
    baseUvcHours,
    totalVolume
  };
}
