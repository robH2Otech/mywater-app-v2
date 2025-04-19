
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

/**
 * Store location data with timestamp and add to history
 */
export async function storeLocationData(unitId: string, locationData: any): Promise<void> {
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
  
  functions.logger.info(`Updated location for unit ${unitId}`);
}

/**
 * Clean up expired location history
 */
export async function cleanupExpiredLocationHistory(): Promise<number> {
  const db = admin.firestore();
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
  
  return deletionCount;
}
