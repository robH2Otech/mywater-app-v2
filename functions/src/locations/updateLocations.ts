
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from '../utils/adminInit';
import { authenticate, getDeviceLocation } from './oneotApi';
import { storeLocationData, cleanupExpiredLocationHistory } from './locationStorage';
import { logFunctionStart, logFunctionSuccess, logFunctionError } from '../utils/errorUtils';

/**
 * Cloud Function to update locations for all units
 */
export const updateAllLocations = onSchedule({
  schedule: '0 6,18 * * *',
  secrets: ['ONEOT_API_KEY', 'ONEOT_API_SECRET', 'ONEOT_ENDPOINT']
}, async (event) => {
  const functionName = 'updateAllLocations';
  
  try {
    logFunctionStart(functionName, {}, null);
    
    const db = getFirestore();
    
    // Get all units with ICCID
    const unitsSnapshot = await db.collection('units').get();
    const units = unitsSnapshot.docs.filter(doc => doc.data().iccid);
    
    console.log(`Found ${units.length} units with ICCID to update`);
    
    // Get authentication token once to use for all requests
    const token = await authenticate();
    
    // Process each unit
    const updates = units.map(async (unitDoc) => {
      const unit = unitDoc.data();
      const iccid = unit.iccid;
      
      try {
        // Get location data from 1oT API
        const locationData = await getDeviceLocation(iccid, token);
        
        // Store location data with timestamp
        await storeLocationData(unitDoc.id, locationData);
        
        return { success: true, iccid };
      } catch (error) {
        console.error(`Error updating location for unit ${unitDoc.id}:`, error);
        return { success: false, iccid, error };
      }
    });
    
    // Wait for all updates to complete
    const results = await Promise.all(updates);
    const succeeded = results.filter(r => r.success).length;
    
    const result = { success: true, updated: succeeded, total: units.length };
    logFunctionSuccess(functionName, result);
    
    console.log(`Location update completed. Success: ${succeeded}/${units.length}`);
    return result;
  } catch (error) {
    logFunctionError(functionName, error);
    console.error('Error in updateAllLocations function:', error);
    throw error;
  }
});

/**
 * Cloud Function to delete expired location history records
 */
export const cleanupLocationHistory = onSchedule({
  schedule: '0 3 * * *'
}, async (event) => {
  const functionName = 'cleanupLocationHistory';
  
  try {
    logFunctionStart(functionName, {}, null);
    
    const deletedCount = await cleanupExpiredLocationHistory();
    
    if (deletedCount === 0) {
      console.log('No expired location history records to delete');
      return null;
    }
    
    const result = { success: true, deletedCount };
    logFunctionSuccess(functionName, result);
    
    console.log(`Successfully deleted ${deletedCount} expired location history records`);
    return result;
  } catch (error) {
    logFunctionError(functionName, error);
    console.error('Error cleaning up location history:', error);
    throw error;
  }
});
