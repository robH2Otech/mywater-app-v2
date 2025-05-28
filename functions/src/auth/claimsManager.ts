
import { onCall } from 'firebase-functions/v2/https';
import { onDocumentUpdated, onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getAuth, getFirestore } from '../utils/adminInit';
import { BusinessUserError, createHttpsError, logFunctionStart, logFunctionStep, logFunctionSuccess, logFunctionError } from '../utils/errorUtils';

export interface UserClaims {
  role: 'superadmin' | 'admin' | 'technician' | 'user';
  company: string;
}

/**
 * Cloud Function to set custom claims for a user
 * Only accessible by superadmins
 */
export const setUserClaims = onCall(async (request) => {
  const functionName = 'setUserClaims';
  const { data, auth: context } = request;
  
  try {
    logFunctionStart(functionName, data, context);

    // Step 1: Authentication check
    logFunctionStep('authentication_check');
    if (!context) {
      throw new BusinessUserError('UNAUTHENTICATED', 'Must be authenticated', {}, 'authentication_check');
    }

    // Step 2: Permission check
    logFunctionStep('permission_check');
    const callerClaims = context.token;
    if (callerClaims.role !== 'superadmin') {
      throw new BusinessUserError('PERMISSION_DENIED', 'Only superadmins can set user claims', { callerRole: callerClaims.role }, 'permission_check');
    }

    // Step 3: Input validation
    logFunctionStep('input_validation');
    const { userId, role, company } = data;
    if (!userId || !role || !company) {
      throw new BusinessUserError('VALIDATION_ERROR', 'userId, role, and company are required', { userId, role, company }, 'input_validation');
    }

    const validRoles = ['superadmin', 'admin', 'technician', 'user'];
    if (!validRoles.includes(role)) {
      throw new BusinessUserError('VALIDATION_ERROR', `Invalid role. Must be one of: ${validRoles.join(', ')}`, { role }, 'input_validation');
    }

    // Step 4: Initialize Firebase services
    logFunctionStep('firebase_initialization');
    const auth = getAuth();
    const db = getFirestore();

    // Step 5: Verify user exists
    logFunctionStep('verify_user_exists', { userId });
    let userRecord;
    try {
      userRecord = await auth.getUser(userId);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new BusinessUserError('NOT_FOUND', 'User not found in Firebase Auth', { userId }, 'user_verification');
      }
      throw error;
    }

    // Step 6: Set custom claims
    logFunctionStep('setting_claims', { userId, role, company });
    await auth.setCustomUserClaims(userId, { role, company });

    // Step 7: Update Firestore document if it exists
    logFunctionStep('updating_firestore_document');
    const userDocRef = db.collection('app_users_business').doc(userId);
    
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      
      if (userDoc.exists) {
        transaction.update(userDocRef, {
          role,
          company,
          updated_at: new Date()
        });
        logFunctionStep('firestore_document_updated', { userId });
      } else {
        logFunctionStep('firestore_document_not_found', { userId });
      }
    });

    // Step 8: Verify claims were set
    logFunctionStep('verifying_claims_set');
    const updatedUser = await auth.getUser(userId);
    const setClaims = updatedUser.customClaims || {};
    
    if (setClaims.role !== role || setClaims.company !== company) {
      throw new BusinessUserError('INTERNAL', 'Claims verification failed after setting', { 
        expected: { role, company }, 
        actual: setClaims 
      }, 'claims_verification');
    }

    const result = { 
      success: true, 
      message: 'Claims updated successfully',
      userId,
      claims: { role, company }
    };

    logFunctionSuccess(functionName, result);
    return result;

  } catch (error: any) {
    logFunctionError(functionName, error);
    
    if (error instanceof BusinessUserError) {
      throw createHttpsError(error);
    }

    const businessError = new BusinessUserError('INTERNAL', `Failed to set user claims: ${error.message}`, { originalError: error }, 'unknown');
    throw createHttpsError(businessError);
  }
});

/**
 * Cloud Function to sync Firestore user data with Auth claims
 * Triggered when user document is updated
 */
export const syncUserClaims = onDocumentUpdated('app_users_business/{userId}', async (event) => {
  const functionName = 'syncUserClaims';
  const userId = event.params.userId;
  
  try {
    logFunctionStart(functionName, { userId }, { auth: null });
    
    const newData = event.data?.after.data();
    
    if (!newData || !newData.role || !newData.company) {
      logFunctionStep('skipping_sync_missing_data', { userId, role: newData?.role, company: newData?.company });
      return;
    }

    const auth = getAuth();

    // Get current claims
    logFunctionStep('getting_current_claims', { userId });
    const userRecord = await auth.getUser(userId);
    const currentClaims = userRecord.customClaims || {};

    // Only update if claims are different
    if (currentClaims.role !== newData.role || currentClaims.company !== newData.company) {
      logFunctionStep('updating_claims', { 
        userId, 
        oldClaims: currentClaims, 
        newClaims: { role: newData.role, company: newData.company } 
      });
      
      await auth.setCustomUserClaims(userId, {
        role: newData.role,
        company: newData.company
      });
      
      logFunctionSuccess(functionName, { userId, role: newData.role, company: newData.company });
    } else {
      logFunctionStep('claims_already_synced', { userId });
    }
  } catch (error: any) {
    logFunctionError(functionName, error, 'sync_operation');
  }
});

/**
 * Cloud Function to initialize claims for new users
 * Triggered when user document is created
 */
export const initializeUserClaims = onDocumentCreated('app_users_business/{userId}', async (event) => {
  const functionName = 'initializeUserClaims';
  const userId = event.params.userId;
  
  try {
    logFunctionStart(functionName, { userId }, { auth: null });
    
    const userData = event.data?.data();
    
    if (!userData || !userData.role || !userData.company) {
      logFunctionStep('skipping_initialization_missing_data', { userId, role: userData?.role, company: userData?.company });
      return;
    }

    const auth = getAuth();
    
    logFunctionStep('initializing_claims', { userId, role: userData.role, company: userData.company });
    await auth.setCustomUserClaims(userId, {
      role: userData.role,
      company: userData.company
    });
    
    logFunctionSuccess(functionName, { userId, role: userData.role, company: userData.company });
  } catch (error: any) {
    logFunctionError(functionName, error, 'initialization');
  }
});

/**
 * Cloud Function to migrate existing users to have proper claims
 */
export const migrateUserClaims = onCall(async (request) => {
  const functionName = 'migrateUserClaims';
  const { data, auth: context } = request;
  
  try {
    logFunctionStart(functionName, data, context);

    // Step 1: Authentication and permission check
    logFunctionStep('authentication_and_permission_check');
    if (!context || context.token.role !== 'superadmin') {
      throw new BusinessUserError('PERMISSION_DENIED', 'Only superadmins can migrate claims', { 
        authenticated: !!context, 
        role: context?.token?.role 
      }, 'permission_check');
    }

    // Step 2: Initialize Firebase services
    logFunctionStep('firebase_initialization');
    const auth = getAuth();
    const db = getFirestore();

    // Step 3: Get all users from Firestore
    logFunctionStep('fetching_users_from_firestore');
    const usersSnapshot = await db.collection('app_users_business').get();
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    const errorDetails: any[] = [];

    logFunctionStep('starting_migration', { totalUsers: usersSnapshot.docs.length });

    // Step 4: Process each user
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;

      try {
        if (!userData.role || !userData.company) {
          logFunctionStep('skipping_user_missing_data', { userId, role: userData.role, company: userData.company });
          skipped++;
          continue;
        }

        // Check if user exists in Firebase Auth
        let userRecord;
        try {
          userRecord = await auth.getUser(userId);
        } catch (authError: any) {
          if (authError.code === 'auth/user-not-found') {
            logFunctionStep('skipping_user_not_in_auth', { userId });
            skipped++;
            continue;
          }
          throw authError;
        }

        // Check if claims already exist and are correct
        const currentClaims = userRecord.customClaims || {};
        if (currentClaims.role === userData.role && currentClaims.company === userData.company) {
          logFunctionStep('skipping_user_claims_already_correct', { userId });
          skipped++;
          continue;
        }

        // Set custom claims
        await auth.setCustomUserClaims(userId, {
          role: userData.role,
          company: userData.company
        });
        
        logFunctionStep('user_migrated_successfully', { userId, role: userData.role, company: userData.company });
        migrated++;

      } catch (userError: any) {
        logFunctionError(functionName, userError, `migration_user_${userId}`);
        errors++;
        errorDetails.push({
          userId,
          error: userError.message,
          step: 'user_migration'
        });
      }
    }

    const result = { 
      success: true, 
      migrated, 
      skipped, 
      errors,
      errorDetails: errors > 0 ? errorDetails : undefined,
      message: `Migration completed: ${migrated} users migrated, ${skipped} skipped, ${errors} errors` 
    };
    
    logFunctionSuccess(functionName, result);
    return result;

  } catch (error: any) {
    logFunctionError(functionName, error);
    
    if (error instanceof BusinessUserError) {
      throw createHttpsError(error);
    }

    const businessError = new BusinessUserError('INTERNAL', `Migration failed: ${error.message}`, { originalError: error }, 'migration_process');
    throw createHttpsError(businessError);
  }
});
