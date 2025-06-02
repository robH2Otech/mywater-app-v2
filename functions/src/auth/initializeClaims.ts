
import { onCall } from 'firebase-functions/v2/https';
import { getAuth, getFirestore } from '../utils/adminInit';
import { BusinessUserError, createHttpsError, logFunctionStart, logFunctionSuccess, logFunctionError } from '../utils/errorUtils';

// Known superadmin emails for automatic claims assignment
const KNOWN_SUPERADMIN_EMAILS = [
  'rob.istria@gmail.com',
  'robert.slavec@gmail.com',
  'aljaz.slavec@gmail.com'
];

/**
 * Initialize claims for the current authenticated user
 */
export const initializeUserClaims = onCall({
  cors: true
}, async (request) => {
  const functionName = 'initializeUserClaims';
  const { auth: context } = request;
  
  try {
    logFunctionStart(functionName, {}, context);
    
    if (!context) {
      throw new BusinessUserError('UNAUTHENTICATED', 'User must be authenticated', {}, 'authentication_check');
    }
    
    const auth = getAuth();
    const db = getFirestore();
    const userId = context.uid;
    
    // Get current user info
    const currentUser = await auth.getUser(userId);
    const userEmail = currentUser.email;
    
    console.log(`Initializing claims for user: ${userEmail} (${userId})`);
    
    // Check if user already has claims
    const currentClaims = currentUser.customClaims || {};
    
    if (currentClaims.role) {
      const result = { success: true, userId, message: 'User already has claims', claims: currentClaims };
      logFunctionSuccess(functionName, result);
      return result;
    }
    
    // Check if this is a known superadmin email
    if (userEmail && KNOWN_SUPERADMIN_EMAILS.includes(userEmail.toLowerCase())) {
      console.log(`Setting superadmin claims for known admin: ${userEmail}`);
      
      await auth.setCustomUserClaims(userId, {
        role: 'superadmin',
        company: 'X-WATER'
      });
      
      // Create or update user document in Firestore
      const userDocRef = db.collection('app_users_business').doc(userId);
      await userDocRef.set({
        id: userId,
        email: userEmail,
        first_name: userEmail.split('@')[0],
        last_name: '',
        role: 'superadmin',
        company: 'X-WATER',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
        auto_assigned: true
      }, { merge: true });
      
      const result = { success: true, userId, initialized: true, role: 'superadmin', company: 'X-WATER', autoAssigned: true };
      logFunctionSuccess(functionName, result);
      return result;
    }
    
    // Look for user in business users collection
    const businessUserDoc = await db.collection('app_users_business').doc(userId).get();
    
    if (businessUserDoc.exists()) {
      const userData = businessUserDoc.data();
      await auth.setCustomUserClaims(userId, {
        role: userData?.role || 'user',
        company: userData?.company || 'X-WATER'
      });
      
      const result = { success: true, userId, initialized: true, role: userData?.role };
      logFunctionSuccess(functionName, result);
      return result;
    }
    
    // Look for user in private users collection
    const privateUserDoc = await db.collection('app_users_privat').doc(userId).get();
    
    if (privateUserDoc.exists()) {
      await auth.setCustomUserClaims(userId, {
        role: 'user',
        company: 'private'
      });
      
      const result = { success: true, userId, initialized: true, role: 'user' };
      logFunctionSuccess(functionName, result);
      return result;
    }
    
    // Default claims if no user document found
    await auth.setCustomUserClaims(userId, {
      role: 'user',
      company: 'X-WATER'
    });
    
    const result = { success: true, userId, initialized: true, role: 'user', company: 'X-WATER' };
    logFunctionSuccess(functionName, result);
    return result;
    
  } catch (error: any) {
    logFunctionError(functionName, error);
    
    if (error instanceof BusinessUserError) {
      throw createHttpsError(error);
    }
    
    const businessError = new BusinessUserError('INTERNAL', `Failed to initialize user claims: ${error.message}`, { originalError: error }, 'claims_initialization');
    throw createHttpsError(businessError);
  }
});

/**
 * Set custom claims for any user (superadmin only)
 */
export const setUserCustomClaims = onCall({
  cors: true
}, async (request) => {
  const functionName = 'setUserCustomClaims';
  const { data, auth: context } = request;
  
  try {
    logFunctionStart(functionName, data, context);
    
    if (!context) {
      throw new BusinessUserError('UNAUTHENTICATED', 'User must be authenticated', {}, 'authentication_check');
    }
    
    // Check if current user is superadmin
    const currentUser = await getAuth().getUser(context.uid);
    const currentClaims = currentUser.customClaims || {};
    
    if (currentClaims.role !== 'superadmin') {
      throw new BusinessUserError('PERMISSION_DENIED', 'Only superadmins can set user claims', {}, 'permission_check');
    }
    
    const { userId, role, company } = data;
    
    // Set custom claims
    await getAuth().setCustomUserClaims(userId, { role, company });
    
    const result = { success: true, userId, role, company };
    logFunctionSuccess(functionName, result);
    return result;
    
  } catch (error: any) {
    logFunctionError(functionName, error);
    
    if (error instanceof BusinessUserError) {
      throw createHttpsError(error);
    }
    
    const businessError = new BusinessUserError('INTERNAL', `Failed to set user claims: ${error.message}`, { originalError: error }, 'claims_update');
    throw createHttpsError(businessError);
  }
});
