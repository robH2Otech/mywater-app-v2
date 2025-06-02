
// Business Users
export { createBusinessUser } from './auth/createBusinessUser';

// Claims Management - Legacy functions
export { 
  setUserClaims, 
  syncUserClaims, 
  initializeUserClaims as initializeUserClaimsLegacy, 
  migrateUserClaims 
} from './auth/claimsManager';

// New Claims Functions - Main implementations
export { 
  initializeUserClaims as initializeUserClaimsNew, 
  setUserCustomClaims as setUserCustomClaimsNew 
} from './auth/initializeClaims';

// Location functions - using correct export name
export { updateAllLocations as updateLocations } from './locations/updateLocations';
export { manualLocationUpdate } from './locations/manualLocationUpdate';
