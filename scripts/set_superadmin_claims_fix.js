
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with your service account
// Download your service account key from Firebase Console > Project Settings > Service Accounts
const serviceAccount = require('./service-account-key.json'); // You need to add this file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setSuperadminClaims() {
  try {
    const superadminEmails = [
      'rob.istria@gmail.com',
      'robert.slavec@gmail.com',
      'aljaz.slavec@gmail.com'
    ];

    console.log('🚀 Starting superadmin claims setup...\n');

    for (const email of superadminEmails) {
      try {
        // Get user by email
        const userRecord = await admin.auth().getUserByEmail(email);
        
        // Set custom claims
        await admin.auth().setCustomUserClaims(userRecord.uid, {
          role: 'superadmin',
          company: 'X-WATER'
        });
        
        // Update Firestore document if it exists
        try {
          const userDocRef = admin.firestore().collection('app_users_business').doc(userRecord.uid);
          const userDoc = await userDocRef.get();
          
          if (userDoc.exists()) {
            await userDocRef.update({
              role: 'superadmin',
              company: 'X-WATER',
              updated_at: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`📄 Updated Firestore document for ${email}`);
          } else {
            // Create Firestore document if it doesn't exist
            await userDocRef.set({
              id: userRecord.uid,
              email: userRecord.email,
              first_name: email.split('@')[0],
              last_name: '',
              role: 'superadmin',
              company: 'X-WATER',
              status: 'active',
              created_at: admin.firestore.FieldValue.serverTimestamp(),
              updated_at: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`📄 Created Firestore document for ${email}`);
          }
        } catch (firestoreError) {
          console.error(`⚠️  Warning: Could not update Firestore for ${email}:`, firestoreError.message);
        }
        
        console.log(`✅ Successfully set superadmin claims for ${email}`);
        console.log(`   UID: ${userRecord.uid}`);
        console.log(`   Claims: { role: 'superadmin', company: 'X-WATER' }\n`);
        
      } catch (userError) {
        if (userError.code === 'auth/user-not-found') {
          console.error(`❌ User not found: ${email} - Please ensure this user has signed up first\n`);
        } else {
          console.error(`❌ Error setting claims for ${email}:`, userError.message, '\n');
        }
      }
    }
    
    console.log('🔄 IMPORTANT: Please ask users to sign out and sign back in for claims to take effect.');
    console.log('🔄 Or they can refresh their token using the admin interface.');
    
  } catch (error) {
    console.error('❌ Script execution failed:', error);
  }
}

// Run the script
setSuperadminClaims().then(() => {
  console.log('\n✅ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
