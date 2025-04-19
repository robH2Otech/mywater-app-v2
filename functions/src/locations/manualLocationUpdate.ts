
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
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to update unit location'
    );
  }
  
  const { iccid } = data;
  
  if (!iccid) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'ICCID is required'
    );
  }
  
  functions.logger.info(`Manual location update requested for ICCID: ${iccid}`);
  
  try {
    // Find unit with this ICCID
    const db = admin.firestore();
    const unitsRef = db.collection('units');
    const unitQuery = await unitsRef.where('iccid', '==', iccid).limit(1).get();
    
    let unitId = "";
    if (!unitQuery.empty) {
      unitId = unitQuery.docs[0].id;
      functions.logger.info(`Found unit ${unitId} for ICCID ${iccid}`);
    } else {
      // Try a more flexible search (may be needed if ICCID formats vary)
      const allUnits = await unitsRef.get();
      const matchingUnit = allUnits.docs.find(doc => {
        const unitData = doc.data();
        return unitData.iccid && (
          unitData.iccid.includes(iccid) || iccid.includes(unitData.iccid)
        );
      });
      
      if (matchingUnit) {
        unitId = matchingUnit.id;
        functions.logger.info(`Found unit ${unitId} with partial ICCID match for ${iccid}`);
      } else {
        throw new functions.https.HttpsError(
          'not-found',
          `No unit found with ICCID ${iccid}`
        );
      }
    }
    
    // Authenticate with 1oT API
    const token = await authenticate();
    
    // Get location data
    const locationData = await getDeviceLocation(iccid, token);
    
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
  } catch (error) {
    functions.logger.error(`Error updating location for ICCID ${iccid}:`, error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to update location: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});
