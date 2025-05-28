
import * as functions from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import { authenticate, getDeviceLocation } from './oneotApi';
import { storeLocationData, cleanupExpiredLocationHistory } from './locationStorage';

/**
 * Cloud Function to update locations for all units
 */
export const updateAllLocations = onSchedule('0 6,18 * * *', async (event) => {
  const db = admin.firestore();
  
  try {
    // Get all units with ICCID
    const unitsSnapshot = await db.collection('units').get();
    const units = unitsSnapshot.docs.filter(doc => doc.data().iccid);
    
    functions.logger.info(`Found ${units.length} units with ICCID to update`);
    
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
        functions.logger.error(`Error updating location for unit ${unitDoc.id}:`, error);
        return { success: false, iccid, error };
      }
    });
    
    // Wait for all updates to complete
    const results = await Promise.all(updates);
    const succeeded = results.filter(r => r.success).length;
    
    functions.logger.info(`Location update completed. Success: ${succeeded}/${units.length}`);
    return { success: true, updated: succeeded, total: units.length };
  } catch (error) {
    functions.logger.error('Error in updateAllLocations function:', error);
    throw error;
  }
});

/**
 * Cloud Function to update location for a specific unit (on-demand)
 */
export { manualLocationUpdate } from './manualLocationUpdate';

/**
 * Cloud Function to delete expired location history records
 * This is a backup to ensure old records are removed even if the inline deletion fails
 */
export const cleanupLocationHistory = onSchedule('0 3 * * *', async (event) => {
  try {
    const deletedCount = await cleanupExpiredLocationHistory();
    
    if (deletedCount === 0) {
      functions.logger.info('No expired location history records to delete');
      return null;
    }
    
    functions.logger.info(`Successfully deleted ${deletedCount} expired location history records`);
    return { success: true, deletedCount };
  } catch (error) {
    functions.logger.error('Error cleaning up location history:', error);
    throw error;
  }
});
