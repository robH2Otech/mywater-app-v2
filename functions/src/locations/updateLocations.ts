
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

// Configure environment variables in Firebase Cloud Functions
// Add these using: firebase functions:config:set oneot.api_key="your-api-key" oneot.endpoint="https://api.1ot.com/v1"

interface OneOTAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface OneOTDiagnosticsResponse {
  imei: string;
  deviceName: string;
  inDataSession: boolean;
  lastNetworkActivity: number;
  lastCountry: string;
  lastOperator: string;
  latitude: number;
  longitude: number;
  radius: number;
}

/**
 * Authenticate with 1oT API
 */
async function authenticate(): Promise<string> {
  const apiKey = functions.config().oneot?.api_key || '';
  const apiSecret = functions.config().oneot?.api_secret || '';
  
  if (!apiKey || !apiSecret) {
    throw new Error('1oT API credentials not configured');
  }
  
  const endpoint = functions.config().oneot?.endpoint || 'https://api.1ot.com/v1';
  const response = await fetch(`${endpoint}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      api_key: apiKey,
      api_secret: apiSecret
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`1oT Authentication failed: ${response.status} ${errorText}`);
  }
  
  const data = await response.json() as OneOTAuthResponse;
  return data.access_token;
}

/**
 * Get device location from 1oT API
 */
async function getDeviceLocation(iccid: string, token: string): Promise<OneOTDiagnosticsResponse> {
  const endpoint = functions.config().oneot?.endpoint || 'https://api.1ot.com/v1';
  const response = await fetch(`${endpoint}/diagnostics/${iccid}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get device location for ${iccid}: ${response.status} ${errorText}`);
  }
  
  return response.json() as Promise<OneOTDiagnosticsResponse>;
}

/**
 * Cloud Function to update locations for all units
 */
export const updateAllLocations = functions.pubsub
  .schedule('0 6,18 * * *')  // Run at 6am and 6pm every day
  .timeZone('UTC')
  .onRun(async () => {
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
          
          // Update Firestore
          await unitDoc.ref.update({
            lastKnownLatitude: locationData.latitude,
            lastKnownLongitude: locationData.longitude,
            lastKnownRadius: locationData.radius,
            lastKnownCountry: locationData.lastCountry,
            lastKnownOperator: locationData.lastOperator,
            locationLastFetchedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          functions.logger.info(`Updated location for unit ${unitDoc.id} with ICCID ${iccid}`);
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
export const updateUnitLocation = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to update unit location'
    );
  }
  
  const { unitId, iccid } = data;
  
  if (!unitId || !iccid) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Unit ID and ICCID are required'
    );
  }
  
  const db = admin.firestore();
  
  try {
    // Authenticate with 1oT API
    const token = await authenticate();
    
    // Get location data
    const locationData = await getDeviceLocation(iccid, token);
    
    // Update Firestore
    await db.collection('units').doc(unitId).update({
      lastKnownLatitude: locationData.latitude,
      lastKnownLongitude: locationData.longitude,
      lastKnownRadius: locationData.radius,
      lastKnownCountry: locationData.lastCountry,
      lastKnownOperator: locationData.lastOperator,
      locationLastFetchedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: true,
      location: {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        radius: locationData.radius,
        lastCountry: locationData.lastCountry,
        lastOperator: locationData.lastOperator
      }
    };
  } catch (error) {
    functions.logger.error(`Error updating location for unit ${unitId}:`, error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to update location: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});
