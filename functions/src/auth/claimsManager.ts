
import { onCall } from 'firebase-functions/v2/https';
import { onDocumentUpdated, onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getAuth, getFirestore } from '../utils/adminInit';
import { BusinessUserError, createHttpsError, logFunctionStart, logFunctionStep, logFunctionSuccess, logFunctionError } from '../utils/errorUtils';

export interface UserClaims {
  role: 'superadmin' | 'admin' | 'technician' | 'user';
  company: string;
}

export const setUserClaims = onCall({
  cors: true
}, async (request) => {
  const functionName = 'setUserClaims';
  const { data, auth: context } = request;
  
  try {
    logFunctionStart(functionName, data, context);

    if (!context) {
      throw new BusinessUserError('UNAUTHENTICATED', 'Must be authenticated', {}, 'authentication_check');
    }

    const callerClaims = context.token;
    if (callerClaims.role !== 'superadmin') {
      throw new BusinessUserError('PERMISSION_DENIED', 'Only superadmins can set user claims', { callerRole: callerClaims.role }, 'permission_check');
    }

    const { userId, role, company } = data;
    if (!userId || !role || !company) {
      throw new BusinessUserError('VALIDATION_ERROR', 'userId, role, and company are required', { userId, role, company }, 'input_validation');
    }

    const validRoles = ['superadmin', 'admin', 'technician', 'user'];
    if (!validRoles.includes(role)) {
      throw new BusinessUserError('VALIDATION_ERROR', `Invalid role. Must be one of: ${validRoles.join(', ')}`, { role }, 'input_validation');
    }

    const auth = getAuth();
    const db = getFirestore();

    let userRecord;
    try {
      userRecord = await auth.getUser(userId);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new BusinessUserError('NOT_FOUND', 'User not found in Firebase Auth', { userId }, 'user_verification');
      }
      throw error;
    }

    await auth.setCustomUserClaims(userId, { role, company });

    const userDocRef = db.collection('app_users_business').doc(userId);
    
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      
      if (userDoc.exists) {
        transaction.update(userDocRef, {
          role,
          company,
          updated_at: new Date()
        });
      }
    });

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
    const userRecord = await auth.getUser(userId);
    const currentClaims = userRecord.customClaims || {};

    if (currentClaims.role !== newData.role || currentClaims.company !== newData.company) {
      await auth.setCustomUserClaims(userId, {
        role: newData.role,
        company: newData.company
      });
      
      logFunctionSuccess(functionName, { userId, role: newData.role, company: newData.company });
    }
  } catch (error: any) {
    logFunctionError(functionName, error, 'sync_operation');
  }
});

export const initializeUserClaims = onDocumentCreated('app_users_business/{userId}', async (event) => {
  const functionName = 'initializeUserClaims';
  const userId = event.params.userId;
  
  try {
    logFunctionStart(functionName, { userId }, { auth: null });
    
    const userData = event.data?.data();
    
    if (!userData || !userData.role || !userData.company) {
      return;
    }

    const auth = getAuth();
    
    await auth.setCustomUserClaims(userId, {
      role: userData.role,
      company: userData.company
    });
    
    logFunctionSuccess(functionName, { userId, role: userData.role, company: userData.company });
  } catch (error: any) {
    logFunctionError(functionName, error, 'initialization');
  }
});

export const migrateUserClaims = onCall({
  cors: true
}, async (request) => {
  const functionName = 'migrateUserClaims';
  const { data, auth: context } = request;
  
  try {
    logFunctionStart(functionName, data, context);

    if (!context || context.token.role !== 'superadmin') {
      throw new BusinessUserError('PERMISSION_DENIED', 'Only superadmins can migrate claims', { 
        authenticated: !!context, 
        role: context?.token?.role 
      }, 'permission_check');
    }

    const auth = getAuth();
    const db = getFirestore();

    const usersSnapshot = await db.collection('app_users_business').get();
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;

      try {
        if (!userData.role || !userData.company) {
          skipped++;
          continue;
        }

        let userRecord;
        try {
          userRecord = await auth.getUser(userId);
        } catch (authError: any) {
          if (authError.code === 'auth/user-not-found') {
            skipped++;
            continue;
          }
          throw authError;
        }

        const currentClaims = userRecord.customClaims || {};
        if (currentClaims.role === userData.role && currentClaims.company === userData.company) {
          skipped++;
          continue;
        }

        await auth.setCustomUserClaims(userId, {
          role: userData.role,
          company: userData.company
        });
        
        migrated++;

      } catch (userError: any) {
        errors++;
      }
    }

    const result = { 
      success: true, 
      migrated, 
      skipped, 
      errors,
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
