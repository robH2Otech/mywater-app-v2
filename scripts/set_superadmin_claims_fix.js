
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./path-to-your-service-account-key.json'); // You need to download this from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setSuperadminClaims() {
  try {
    const superadminEmails = [
      'rob.istria@gmail.com',
      'robert.slavec@gmail.com'
    ];

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
        console.log(`   UID: ${userRecord.uid}`);
        console.log(`   Claims: { role: 'superadmin', company: 'X-WATER' }`);
        
      } catch (userError) {
        console.error(`❌ Error setting claims for ${email}:`, userError.message);
      }
    }
    
    console.log('\n🔄 Please ask users to sign out and sign back in for claims to take effect.');
    
  } catch (error) {
    console.error('❌ Script execution failed:', error);
  }
}

// Run the script
setSuperadminClaims().then(() => {
  console.log('✅ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
