
// Remove duplicate Firebase Admin initialization
import { updateAllLocations, manualLocationUpdate, cleanupLocationHistory } from './locations/updateLocations';
import { onOrderCreated } from './orders/orderWebhook';
import { onReferralUsed } from './referrals/handleReferralWebhook';
import { setUserClaims, syncUserClaims, initializeUserClaims, migrateUserClaims } from './auth/claimsManager';
import { createBusinessUser } from './auth/createBusinessUser';

// Export the Cloud Functions with enhanced error handling and logging
export {
  updateAllLocations,
  manualLocationUpdate,
  cleanupLocationHistory,
  onOrderCreated,
  onReferralUsed,
  setUserClaims,
  syncUserClaims,
  initializeUserClaims,
  migrateUserClaims,
  createBusinessUser
};
