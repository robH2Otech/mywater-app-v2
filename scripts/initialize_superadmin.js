
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Make sure you have your service account key in the same directory
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function initializeSuperadmin() {
  try {
    const superadminEmail = 'rob.istria@gmail.com';
    
    console.log('🚀 Initializing superadmin claims for:', superadminEmail);
    
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(superadminEmail);
    console.log('📧 Found user:', userRecord.uid);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'superadmin',
      company: 'X-WATER'
    });
    
    console.log('✅ Custom claims set successfully');
    
    // Update Firestore document
    const userDocRef = admin.firestore().collection('app_users_business').doc(userRecord.uid);
    const userDoc = await userDocRef.get();
    
    if (userDoc.exists()) {
      await userDocRef.update({
        role: 'superadmin',
        company: 'X-WATER',
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('📄 Firestore document updated');
    } else {
      // Create document if it doesn't exist
      await userDocRef.set({
        id: userRecord.uid,
        email: userRecord.email,
        first_name: 'Rob',
        last_name: 'Istria',
        role: 'superadmin',
        company: 'X-WATER',
        status: 'active',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('📄 Firestore document created');
    }
    
    // Verify claims were set
    const updatedUser = await admin.auth().getUser(userRecord.uid);
    console.log('🔍 Verification - Custom claims:', updatedUser.customClaims);
    
    console.log('🎉 Superadmin initialization complete!');
    console.log('⚠️  Important: Please sign out and sign back in for claims to take effect');
    
  } catch (error) {
    console.error('❌ Error initializing superadmin:', error);
  } finally {
    process.exit(0);
  }
}

initializeSuperadmin();
