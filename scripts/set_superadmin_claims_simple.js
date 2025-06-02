
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You need to download your service account key from Firebase Console
const serviceAccount = require('./service-account-key.json');

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

    console.log('🚀 Setting superadmin claims...\n');

    for (const email of superadminEmails) {
      try {
        // Get user by email
        const userRecord = await admin.auth().getUserByEmail(email);
        
        // Set custom claims
        await admin.auth().setCustomUserClaims(userRecord.uid, {
          role: 'superadmin',
          company: 'X-WATER'
        });
        
        console.log(`✅ Successfully set superadmin claims for ${email}`);
        console.log(`   UID: ${userRecord.uid}\n`);
        
      } catch (userError) {
        if (userError.code === 'auth/user-not-found') {
          console.error(`❌ User not found: ${email}\n`);
        } else {
          console.error(`❌ Error setting claims for ${email}:`, userError.message, '\n');
        }
      }
    }
    
    console.log('🔄 IMPORTANT: Users need to sign out and sign back in for claims to take effect.');
    
  } catch (error) {
    console.error('❌ Script execution failed:', error);
  }
}

setSuperadminClaims().then(() => {
  console.log('\n✅ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
