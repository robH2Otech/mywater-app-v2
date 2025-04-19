
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { authenticate, getDeviceLocation } from './oneotApi';
import { storeLocationData } from './locationStorage';

/**
 * Cloud Function to update location for a specific ICCID (on-demand)
 */
export const manualLocationUpdate = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    functions.logger.warn('Unauthenticated request to update location');
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to update unit location'
    );
  }
  
  const { iccid } = data;
  
  if (!iccid) {
    functions.logger.warn('Missing ICCID in request');
    throw new functions.https.HttpsError(
      'invalid-argument',
      'ICCID is required'
    );
  }
  
  functions.logger.info(`Manual location update requested for ICCID: ${iccid} by user ${context.auth.uid}`);
  
  try {
    // Find unit with this ICCID
    const db = admin.firestore();
    const unitsRef = db.collection('units');
    
    // First try exact match
    let unitQuery = await unitsRef.where('iccid', '==', iccid).limit(1).get();
    
    if (unitQuery.empty) {
      functions.logger.info(`No exact match for ICCID ${iccid}, trying partial match`);
      
      // Try contains match (both directions)
      const allUnits = await unitsRef.get();
      const matchingUnits = allUnits.docs.filter(doc => {
        const unitData = doc.data();
        return unitData.iccid && (
          unitData.iccid.includes(iccid) || iccid.includes(unitData.iccid)
        );
      });
      
      if (matchingUnits.length > 0) {
        functions.logger.info(`Found ${matchingUnits.length} units with partial ICCID match for ${iccid}`);
        // If multiple matches, take the closest match by length
        matchingUnits.sort((a, b) => {
          return Math.abs(a.data().iccid.length - iccid.length) - 
                 Math.abs(b.data().iccid.length - iccid.length);
        });
        
        const unitId = matchingUnits[0].id;
        const unitData = matchingUnits[0].data();
        
        functions.logger.info(`Selected unit ${unitId} with ICCID ${unitData.iccid}`);
        
        // Use the unit's actual ICCID for the API request (could be different format)
        const actualIccid = unitData.iccid;
        
        // Authenticate with 1oT API
        const token = await authenticate();
        
        // Get location data
        const locationData = await getDeviceLocation(actualIccid, token);
        
        // Store location data
        await storeLocationData(unitId, locationData);
        
        return {
          success: true,
          location: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            radius: locationData.radius,
            lastCountry: locationData.lastCountry,
            lastOperator: locationData.lastOperator,
            timestamp: new Date().toISOString()
          }
        };
      } else {
        functions.logger.warn(`No unit found matching ICCID ${iccid}`);
        throw new functions.https.HttpsError(
          'not-found',
          `No unit found with ICCID ${iccid}`
        );
      }
    } else {
      const unitId = unitQuery.docs[0].id;
      const unitData = unitQuery.docs[0].data();
      functions.logger.info(`Found unit ${unitId} with exact ICCID match ${unitData.iccid}`);
      
      // Authenticate with 1oT API
      const token = await authenticate();
      
      // Get location data
      const locationData = await getDeviceLocation(unitData.iccid, token);
      
      // Store location data
      await storeLocationData(unitId, locationData);
      
      return {
        success: true,
        location: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          radius: locationData.radius,
          lastCountry: locationData.lastCountry,
          lastOperator: locationData.lastOperator,
          timestamp: new Date().toISOString()
        }
      };
    }
  } catch (error) {
    functions.logger.error(`Error updating location for ICCID ${iccid}:`, error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to update location: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});
