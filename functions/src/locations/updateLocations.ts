
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
 * Store location data with timestamp and add to history
 */
async function storeLocationData(unitId: string, locationData: any): Promise<void> {
  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();
  
  // Current location data to update on the unit
  const locationUpdate = {
    lastKnownLatitude: locationData.latitude,
    lastKnownLongitude: locationData.longitude,
    lastKnownRadius: locationData.radius,
    lastKnownCountry: locationData.lastCountry,
    lastKnownOperator: locationData.lastOperator,
    locationLastFetchedAt: now
  };
  
  // Update unit with current location
  await db.collection('units').doc(unitId).update(locationUpdate);
  
  // Also store in history collection with TTL
  const historyData = {
    ...locationUpdate,
    unitId,
    createdAt: now,
    // TTL field for automatic deletion after 24 hours
    expireAt: admin.firestore.Timestamp.fromMillis(Date.now() + (24 * 60 * 60 * 1000))
  };
  
  await db.collection('locationHistory').add(historyData);
  
  // Clean up expired location history
  const twentyFourHoursAgo = admin.firestore.Timestamp.fromMillis(Date.now() - (24 * 60 * 60 * 1000));
  const expiredDocs = await db.collection('locationHistory')
    .where('expireAt', '<', twentyFourHoursAgo)
    .limit(100) // Process in batches to avoid timeout
    .get();
  
  // Delete expired docs
  const batch = db.batch();
  let deletionCount = 0;
  
  expiredDocs.docs.forEach(doc => {
    batch.delete(doc.ref);
    deletionCount++;
  });
  
  if (deletionCount > 0) {
    await batch.commit();
    functions.logger.info(`Deleted ${deletionCount} expired location history records`);
  }
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
          
          // Store location data with timestamp
          await storeLocationData(unitDoc.id, locationData);
          
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
    
    // Store location data with timestamp and history
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
    functions.logger.error(`Error updating location for unit ${unitId}:`, error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to update location: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});

/**
 * Cloud Function to delete expired location history records
 * This is a backup to ensure old records are removed even if the inline deletion fails
 */
export const cleanupLocationHistory = functions.pubsub
  .schedule('0 3 * * *')  // Run at 3am every day
  .timeZone('UTC')
  .onRun(async () => {
    const db = admin.firestore();
    
    try {
      const twentyFourHoursAgo = admin.firestore.Timestamp.fromMillis(Date.now() - (24 * 60 * 60 * 1000));
      const expiredDocs = await db.collection('locationHistory')
        .where('expireAt', '<', twentyFourHoursAgo)
        .get();
      
      if (expiredDocs.empty) {
        functions.logger.info('No expired location history records to delete');
        return null;
      }
      
      // Delete in batches to avoid write limits
      const batchSize = 500;
      let deletedCount = 0;
      const batches = [];
      
      for (let i = 0; i < expiredDocs.docs.length; i += batchSize) {
        const batch = db.batch();
        const currentBatch = expiredDocs.docs.slice(i, i + batchSize);
        
        currentBatch.forEach(doc => {
          batch.delete(doc.ref);
          deletedCount++;
        });
        
        batches.push(batch.commit());
      }
      
      await Promise.all(batches);
      functions.logger.info(`Successfully deleted ${deletedCount} expired location history records`);
      
      return { success: true, deletedCount };
    } catch (error) {
      functions.logger.error('Error cleaning up location history:', error);
      throw error;
    }
  });
