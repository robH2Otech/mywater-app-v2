
// Export all Cloud Functions

// Auth functions
export { createBusinessUser } from './auth/createBusinessUser';
export { setUserClaims, syncUserClaims, initializeUserClaims, migrateUserClaims } from './auth/claimsManager';

// Location tracking functions
export { updateAllLocations, cleanupLocationHistory } from './locations/updateLocations';
export { manualLocationUpdate } from './locations/manualLocationUpdate';

// Order processing functions
export { onOrderCreated } from './orders/orderWebhook';
