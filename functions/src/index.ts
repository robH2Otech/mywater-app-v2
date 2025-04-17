
import * as admin from 'firebase-admin';
import { updateAllLocations, updateUnitLocation, cleanupLocationHistory } from './locations/updateLocations';

// Initialize Firebase Admin
admin.initializeApp();

// Set up Firestore TTL for locationHistory collection
const db = admin.firestore();

// Create TTL index on the locationHistory collection (if it doesn't exist)
// This ensures documents are automatically deleted after 24 hours
async function setupFirestoreTTL() {
  try {
    // Check if the TTL field exists in collection config
    const collectionRef = db.collection('locationHistory');
    const ttlSettings = await collectionRef.listIndexes().then(indexes => 
      indexes.find(index => index.fields.some(field => field.fieldPath === 'ttl'))
    );

    // If TTL field doesn't exist, add it programmatically
    if (!ttlSettings) {
      console.log('Setting up TTL index for locationHistory collection');
      
      // Note: This doesn't actually create the index, just logs that it should be created
      // TTL indexes must be created manually via Firebase console or CLI
      console.log('TTL index must be created manually with field "createdAt" and expiration of 86400 seconds (24 hours)');
    } else {
      console.log('TTL index already exists for locationHistory collection');
    }
  } catch (error) {
    console.error('Error setting up TTL index:', error);
  }
}

// Run the TTL setup
setupFirestoreTTL().catch(console.error);

// Export the Cloud Functions
export {
  updateAllLocations,
  updateUnitLocation,
  cleanupLocationHistory
};
