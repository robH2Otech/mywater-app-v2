
import { onCall } from 'firebase-functions/v2/https';
import { getAuth } from '../utils/adminInit';
import { getFirestore } from '../utils/adminInit';
import { BusinessUserError, createHttpsError, logFunctionStart, logFunctionSuccess, logFunctionError } from '../utils/errorUtils';

interface CreateBusinessUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company: string;
  job_title?: string;
  role: 'superadmin' | 'admin' | 'technician' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  password: string;
}

/**
 * Cloud Function to create business users without affecting current session
 */
export const createBusinessUser = onCall({
  cors: true
}, async (request) => {
  const functionName = 'createBusinessUser';
  const { data, auth: context } = request;
  
  try {
    logFunctionStart(functionName, data, context);
    
    // Ensure user is authenticated
    if (!context) {
      throw new BusinessUserError('UNAUTHENTICATED', 'User must be authenticated to create business users', {}, 'authentication_check');
    }
    
    // Get current user's token to check permissions
    const currentUserToken = await getAuth().getUser(context.uid);
    const currentUserClaims = currentUserToken.customClaims || {};
    
    // Only superadmins and admins can create users
    if (!['superadmin', 'admin'].includes(currentUserClaims.role as string)) {
      throw new BusinessUserError('PERMISSION_DENIED', 'Only administrators can create business users', { requiredRole: 'admin' }, 'permission_check');
    }
    
    const userData = data as CreateBusinessUserRequest;
    
    // Validate required fields
    if (!userData.email || !userData.password || !userData.first_name || !userData.last_name || !userData.company) {
      throw new BusinessUserError('VALIDATION_ERROR', 'Missing required fields', { userData }, 'input_validation');
    }
    
    // Create user in Firebase Auth
    const auth = getAuth();
    const userRecord = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: `${userData.first_name} ${userData.last_name}`,
      disabled: userData.status !== 'active'
    });
    
    // Set custom claims for the new user
    await auth.setCustomUserClaims(userRecord.uid, {
      role: userData.role,
      company: userData.company
    });
    
    // Create user document in Firestore
    const db = getFirestore();
    await db.collection('app_users_business').doc(userRecord.uid).set({
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone: userData.phone || '',
      company: userData.company,
      job_title: userData.job_title || '',
      role: userData.role,
      status: userData.status,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: context.uid
    });
    
    const result = {
      success: true,
      userId: userRecord.uid,
      message: 'Business user created successfully'
    };
    
    logFunctionSuccess(functionName, result);
    return result;
    
  } catch (error: any) {
    logFunctionError(functionName, error);
    
    if (error instanceof BusinessUserError) {
      throw createHttpsError(error);
    }
    
    const businessError = new BusinessUserError('INTERNAL', `Failed to create business user: ${error.message}`, { originalError: error }, 'user_creation');
    throw createHttpsError(businessError);
  }
});
