
// Export only the functions that actually exist

// Auth functions
export { createBusinessUser } from './auth/createBusinessUser';

// Note: Other functions (setUserClaims, location functions, order functions) 
// are commented out because the source files don't exist yet
// Uncomment these when the corresponding files are created:

// export { setUserClaims, syncUserClaims, initializeUserClaims, migrateUserClaims } from './auth/claimsManager';
// export { updateAllLocations, cleanupLocationHistory } from './locations/updateLocations';
// export { manualLocationUpdate } from './locations/manualLocationUpdate';
// export { onOrderCreated } from './orders/orderWebhook';
