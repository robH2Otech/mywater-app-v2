
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

export interface UserClaims {
  role: 'superadmin' | 'admin' | 'technician' | 'user';
  company: string;
}

/**
 * Cloud Function to set custom claims for a user
 * Only accessible by superadmins
 */
export const setUserClaims = functions.https.onCall(async (data, context) => {
  // Verify caller is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  // Verify caller is superadmin
  const callerClaims = context.auth.token;
  if (callerClaims.role !== 'superadmin') {
    throw new functions.https.HttpsError('permission-denied', 'Only superadmins can set user claims');
  }

  const { userId, role, company } = data;

  if (!userId || !role || !company) {
    throw new functions.https.HttpsError('invalid-argument', 'userId, role, and company are required');
  }

  try {
    console.log(`Setting claims for user ${userId}: role=${role}, company=${company}`);
    
    // Set custom claims
    await auth.setCustomUserClaims(userId, { role, company });

    // Update Firestore document to match
    const userDocRef = db.collection('app_users_business').doc(userId);
    const userDoc = await userDocRef.get();
    
    if (userDoc.exists()) {
      await userDocRef.update({
        role,
        company,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Firestore document updated for user ${userId}`);
    } else {
      console.log(`Warning: Firestore document not found for user ${userId}`);
    }

    console.log(`Claims set successfully for user ${userId}: role=${role}, company=${company}`);
    return { success: true, message: 'Claims updated successfully' };
  } catch (error) {
    console.error('Error setting claims:', error);
    throw new functions.https.HttpsError('internal', `Failed to set user claims: ${error.message}`);
  }
});

/**
 * Cloud Function to sync Firestore user data with Auth claims
 * Triggered when user document is updated
 */
export const syncUserClaims = functions.firestore
  .document('app_users_business/{userId}')
  .onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const newData = change.after.data();
    
    if (!newData.role || !newData.company) {
      console.log(`Skipping claims sync for ${userId} - missing role or company`);
      return;
    }

    try {
      // Get current claims
      const userRecord = await auth.getUser(userId);
      const currentClaims = userRecord.customClaims || {};

      // Only update if claims are different
      if (currentClaims.role !== newData.role || currentClaims.company !== newData.company) {
        await auth.setCustomUserClaims(userId, {
          role: newData.role,
          company: newData.company
        });
        console.log(`Claims synced for user ${userId}: role=${newData.role}, company=${newData.company}`);
      }
    } catch (error) {
      console.error(`Error syncing claims for user ${userId}:`, error);
    }
  });

/**
 * Cloud Function to initialize claims for new users
 * Triggered when user document is created
 */
export const initializeUserClaims = functions.firestore
  .document('app_users_business/{userId}')
  .onCreate(async (snap, context) => {
    const userId = context.params.userId;
    const userData = snap.data();
    
    if (!userData.role || !userData.company) {
      console.log(`Skipping claims initialization for ${userId} - missing role or company`);
      return;
    }

    try {
      await auth.setCustomUserClaims(userId, {
        role: userData.role,
        company: userData.company
      });
      console.log(`Claims initialized for new user ${userId}: role=${userData.role}, company=${userData.company}`);
    } catch (error) {
      console.error(`Error initializing claims for user ${userId}:`, error);
    }
  });

/**
 * Cloud Function to migrate existing users to have proper claims
 */
export const migrateUserClaims = functions.https.onCall(async (data, context) => {
  // Verify caller is authenticated and is superadmin
  if (!context.auth || context.auth.token.role !== 'superadmin') {
    throw new functions.https.HttpsError('permission-denied', 'Only superadmins can migrate claims');
  }

  try {
    console.log('Starting user claims migration...');
    
    const usersSnapshot = await db.collection('app_users_business').get();
    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;

      if (!userData.role || !userData.company) {
        console.log(`Skipping user ${userId} - missing role or company data`);
        skipped++;
        continue;
      }

      try {
        // Check if user exists in Firebase Auth
        const userRecord = await auth.getUser(userId);
        
        // Set custom claims
        await auth.setCustomUserClaims(userId, {
          role: userData.role,
          company: userData.company
        });
        
        console.log(`Migrated claims for user ${userId}: ${userData.role}@${userData.company}`);
        migrated++;
      } catch (authError: any) {
        if (authError.code === 'auth/user-not-found') {
          console.log(`User ${userId} not found in Firebase Auth, skipping...`);
          skipped++;
        } else {
          console.error(`Failed to migrate claims for user ${userId}:`, authError);
          errors++;
        }
      }
    }

    const result = { 
      success: true, 
      migrated, 
      skipped, 
      errors,
      message: `Migration completed: ${migrated} users migrated, ${skipped} skipped, ${errors} errors` 
    };
    
    console.log('Migration completed:', result);
    return result;
  } catch (error) {
    console.error('Error during migration:', error);
    throw new functions.https.HttpsError('internal', `Migration failed: ${error.message}`);
  }
});
