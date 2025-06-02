
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

async function setSuperadminClaims() {
  try {
    // Check if service account file exists
    const serviceAccountPath = path.join(__dirname, 'service-account-key.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      console.log('❌ Service account key file not found!');
      console.log('📝 Please follow these steps:');
      console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
      console.log('2. Click "Generate new private key"');
      console.log('3. Save the file as "service-account-key.json" in the scripts folder');
      console.log('4. Run this script again');
      process.exit(1);
    }

    // Initialize Firebase Admin SDK
    const serviceAccount = require('./service-account-key.json');
    
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

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
    console.log('✅ Script completed successfully!');
    
  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
    
    if (error.message.includes('service account')) {
      console.log('\n📝 Service account setup required:');
      console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
      console.log('2. Click "Generate new private key"');
      console.log('3. Save as "service-account-key.json" in scripts folder');
    }
  }
}

setSuperadminClaims().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
