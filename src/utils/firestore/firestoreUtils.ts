
/**
 * Converts Firestore Timestamp fields to JavaScript Date objects
 * @param data The Firestore document data
 * @param dateFields Array of field names that should be converted from Timestamp to Date
 * @returns Object with converted date fields
 */
export function convertFirestoreDates(data: any, dateFields: string[]) {
  if (!data) return data;
  
  const result = { ...data };
  
  dateFields.forEach(field => {
    if (result[field]) {
      if (result[field].toDate) {
        // Convert Firestore Timestamp to Date
        result[field] = result[field].toDate();
      } else if (typeof result[field] === 'string' || typeof result[field] === 'number') {
        // Convert string or number to Date
        result[field] = new Date(result[field]);
      }
    }
  });
  
  return result;
}

/**
 * Prepares data for Firestore by converting Date objects to Firestore-compatible format
 * @param data The data to prepare
 * @returns Firestore-ready data
 */
export function prepareDataForFirestore(data: any) {
  const result = { ...data };
  
  // Remove any properties that would cause issues
  if (result.id) delete result.id;
  
  return result;
}
