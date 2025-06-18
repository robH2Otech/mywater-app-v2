
/**
 * Processes the base unit data from a Firestore document
 */
export function processUnitBaseData(unitDoc: any): {
  id: string;
  unitData: any;
  baseUvcHours: number;
  totalVolume: number;
} {
  const unitData = unitDoc.data();
  const unitId = unitDoc.id;
  
  // Parse base UVC hours from unit document
  let baseUvcHours = unitData.uvc_hours;
  if (typeof baseUvcHours === 'string') {
    baseUvcHours = parseFloat(baseUvcHours);
  } else if (baseUvcHours === undefined || baseUvcHours === null) {
    baseUvcHours = 0;
  }
  
  // Parse total volume from unit document
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
