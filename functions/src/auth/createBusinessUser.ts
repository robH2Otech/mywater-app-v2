
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export const createBusinessUser = functions.https.onCall(async (data, context) => {
  // Verify caller is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  // Verify caller has admin permissions
  const callerClaims = context.auth.token;
  if (!['superadmin', 'admin'].includes(callerClaims.role)) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can create users');
  }

  const {
    first_name,
    last_name,
    email,
    phone,
    company,
    job_title,
    role,
    status,
    password
  } = data;

  // Validate required fields
  if (!first_name || !last_name || !email || !password || !company) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  // Validate role permissions
  if (callerClaims.role === 'admin' && !['technician', 'user'].includes(role)) {
    throw new functions.https.HttpsError('permission-denied', `Admins cannot create ${role} users`);
  }

  try {
    console.log(`Creating new business user: ${email}`);

    // Step 1: Create Firebase Auth user using Admin SDK
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false,
      disabled: false
    });

    console.log(`Firebase Auth user created with UID: ${userRecord.uid}`);

    // Step 2: Set custom claims immediately
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role,
      company
    });

    console.log(`Custom claims set for user ${userRecord.uid}: role=${role}, company=${company}`);

    // Step 3: Create Firestore document
    const userDocRef = admin.firestore().collection('app_users_business').doc(userRecord.uid);
    await userDocRef.set({
      id: userRecord.uid,
      first_name,
      last_name,
      email,
      phone: phone || "",
      company,
      job_title: job_title || "",
      role,
      status: status || "active",
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Firestore document created for user ${userRecord.uid}`);

    return {
      success: true,
      userId: userRecord.uid,
      message: 'User created successfully'
    };

  } catch (error: any) {
    console.error('Error creating business user:', error);
    
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-exists') {
      errorMessage = "A user with this email already exists";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Password should be at least 6 characters";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Invalid email address";
    }

    throw new functions.https.HttpsError('internal', errorMessage);
  }
});
