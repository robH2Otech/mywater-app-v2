
const admin = require('firebase-admin');
// You would need to download your service account key from Firebase console
// and pass it here in a secure way - NEVER commit this file to version control
const serviceAccount = require('./service-account-key.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setSuperadminClaims(email) {
  try {
    // Get the user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'superadmin',
      company: 'xwater',  // Set appropriate company or null if superadmin can access all
      mfaEnrolled: false, // Update to true when MFA is implemented
      createdAt: new Date().toISOString()
    });
    
    console.log(`Superadmin claims set for user: ${email}`);
    
    // Verify the claims were set
    const updatedUser = await admin.auth().getUser(user.uid);
    console.log('Updated user claims:', updatedUser.customClaims);
    
    return true;
  } catch (error) {
    console.error('Error setting superadmin claims:', error);
    return false;
  }
}

// Call the function with your email
setSuperadminClaims('rob.istria@gmail.com')
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
