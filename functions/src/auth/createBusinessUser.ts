
import { onCall } from 'firebase-functions/v2/https';
import { getAuth, getFirestore } from '../utils/adminInit';
import { validateCreateUserData, validateCallerPermissions } from '../utils/validationUtils';
import { BusinessUserError, createHttpsError, logFunctionStart, logFunctionStep, logFunctionSuccess, logFunctionError } from '../utils/errorUtils';

export const createBusinessUser = onCall(async (request) => {
  const functionName = 'createBusinessUser';
  const { data, auth: context } = request;
  
  try {
    logFunctionStart(functionName, data, context);

    // Step 1: Authentication check
    logFunctionStep('authentication_check');
    if (!context) {
      throw new BusinessUserError('UNAUTHENTICATED', 'Must be authenticated', {}, 'authentication_check');
    }

    // Step 2: Validate caller permissions
    logFunctionStep('permission_validation');
    const callerClaims = context.token;
    validateCallerPermissions(callerClaims, data.role);

    // Step 3: Validate and sanitize input data
    logFunctionStep('input_validation');
    const validatedData = validateCreateUserData(data);

    // Step 4: Initialize Firebase services
    logFunctionStep('firebase_initialization');
    const auth = getAuth();
    const db = getFirestore();

    let userRecord: any = null;
    let firestoreDocCreated = false;

    try {
      // Step 5: Create Firebase Auth user
      logFunctionStep('create_firebase_auth_user', { email: validatedData.email });
      userRecord = await auth.createUser({
        email: validatedData.email,
        password: validatedData.password,
        emailVerified: false,
        disabled: false,
        displayName: `${validatedData.first_name} ${validatedData.last_name}`
      });

      logFunctionStep('firebase_auth_user_created', { uid: userRecord.uid });

      // Step 6: Set custom claims immediately
      logFunctionStep('setting_custom_claims', { 
        uid: userRecord.uid, 
        role: validatedData.role, 
        company: validatedData.company 
      });
      
      await auth.setCustomUserClaims(userRecord.uid, {
        role: validatedData.role,
        company: validatedData.company
      });

      logFunctionStep('custom_claims_set_successfully');

      // Step 7: Create Firestore document in transaction
      logFunctionStep('creating_firestore_document');
      
      const userDocRef = db.collection('app_users_business').doc(userRecord.uid);
      
      await db.runTransaction(async (transaction) => {
        // Check if document already exists
        const existingDoc = await transaction.get(userDocRef);
        if (existingDoc.exists) {
          throw new BusinessUserError('ALREADY_EXISTS', 'User document already exists in Firestore', { uid: userRecord.uid }, 'firestore_creation');
        }

        // Create the document
        const userData = {
          id: userRecord.uid,
          first_name: validatedData.first_name,
          last_name: validatedData.last_name,
          email: validatedData.email,
          phone: validatedData.phone,
          company: validatedData.company,
          job_title: validatedData.job_title,
          role: validatedData.role,
          status: validatedData.status,
          created_at: new Date(),
          updated_at: new Date()
        };

        transaction.set(userDocRef, userData);
        
        logFunctionStep('firestore_document_created_in_transaction', { uid: userRecord.uid });
      });

      firestoreDocCreated = true;

      // Step 8: Verify claims were set correctly
      logFunctionStep('verifying_claims');
      const updatedUserRecord = await auth.getUser(userRecord.uid);
      const claims = updatedUserRecord.customClaims || {};
      
      if (claims.role !== validatedData.role || claims.company !== validatedData.company) {
        logFunctionStep('claims_verification_failed', { 
          expected: { role: validatedData.role, company: validatedData.company },
          actual: claims 
        });
        throw new BusinessUserError('INTERNAL', 'Claims verification failed', { expected: validatedData, actual: claims }, 'claims_verification');
      }

      logFunctionStep('claims_verified_successfully', claims);

      // Step 9: Return success
      const result = {
        success: true,
        userId: userRecord.uid,
        message: 'User created successfully with proper claims and Firestore document'
      };

      logFunctionSuccess(functionName, result);
      return result;

    } catch (error: any) {
      logFunctionError(functionName, error, 'user_creation_transaction');
      
      // Cleanup on failure
      if (userRecord) {
        logFunctionStep('cleanup_on_failure', { uid: userRecord.uid });
        
        try {
          // Delete Firebase Auth user if Firestore creation failed
          if (!firestoreDocCreated) {
            await auth.deleteUser(userRecord.uid);
            logFunctionStep('cleanup_auth_user_deleted');
          }
        } catch (cleanupError: any) {
          logFunctionError(functionName, cleanupError, 'cleanup');
        }
      }
      
      throw error;
    }

  } catch (error: any) {
    logFunctionError(functionName, error);
    
    if (error instanceof BusinessUserError) {
      throw createHttpsError(error);
    }

    // Handle specific Firebase Auth errors
    if (error.code === 'auth/email-already-exists') {
      const businessError = new BusinessUserError('ALREADY_EXISTS', 'A user with this email already exists', { originalError: error.code }, 'firebase_auth_creation');
      throw createHttpsError(businessError);
    } else if (error.code === 'auth/weak-password') {
      const businessError = new BusinessUserError('VALIDATION_ERROR', 'Password should be at least 6 characters', { originalError: error.code }, 'firebase_auth_creation');
      throw createHttpsError(businessError);
    } else if (error.code === 'auth/invalid-email') {
      const businessError = new BusinessUserError('VALIDATION_ERROR', 'Invalid email address', { originalError: error.code }, 'firebase_auth_creation');
      throw createHttpsError(businessError);
    }

    // Handle Firestore errors
    if (error.code?.startsWith('firestore/')) {
      const businessError = new BusinessUserError('INTERNAL', `Database error: ${error.message}`, { originalError: error.code }, 'firestore_operation');
      throw createHttpsError(businessError);
    }

    // Generic error
    const businessError = new BusinessUserError('INTERNAL', `Unexpected error: ${error.message}`, { originalError: error }, 'unknown');
    throw createHttpsError(businessError);
  }
});
