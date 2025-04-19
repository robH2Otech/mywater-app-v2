
/**
 * Process the basic unit data from a Firestore document
 */
export function processUnitBaseData(unitDoc: any) {
  const unitData = unitDoc.data();
  const unitId = unitDoc.id;
  
  // Parse UVC hours from unit document
  let baseUvcHours = unitData.uvc_hours;
  if (typeof baseUvcHours === 'string') {
    baseUvcHours = parseFloat(baseUvcHours);
  } else if (baseUvcHours === undefined || baseUvcHours === null) {
    baseUvcHours = 0;
  }
  
  // Parse total volume to ensure it's a number
  let totalVolume = unitData.total_volume;
  if (typeof totalVolume === 'string') {
    totalVolume = parseFloat(totalVolume);
  } else if (totalVolume === undefined || totalVolume === null) {
    totalVolume = 0;
  }
  
  console.log(`Unit ${unitId} base data - Name: ${unitData.name}, UVC Hours: ${baseUvcHours}, Type: ${unitData.unit_type}`);
  
  return {
    id: unitId,
    unitData,
    baseUvcHours,
    totalVolume
  };
}
