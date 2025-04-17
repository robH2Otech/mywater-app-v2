
import * as admin from 'firebase-admin';
import { updateAllLocations, updateUnitLocation, cleanupLocationHistory } from './locations/updateLocations';

// Initialize Firebase Admin
admin.initializeApp();

// Export the Cloud Functions
export {
  updateAllLocations,
  updateUnitLocation,
  cleanupLocationHistory
};
