
const admin = require('firebase-admin');
// You would need to download your service account key from Firebase console
// and pass it here in a secure way - NEVER commit this file to version control
const serviceAccount = require('./service-account-key.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Array of superadmin emails to set claims for
const superadminEmails = [
  'rob.istria@gmail.com',
  'robert.slavec@gmail.com',
  'aljaz.slavec@gmail.com'
];

async function setSuperadminClaims(email) {
  try {
    // Get the user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'superadmin',
      company: 'xwater',  // Keep this for identification and logging purposes
      mfaEnrolled: false, // Update to true when MFA is implemented
      createdAt: new Date().toISOString()
    });
    
    console.log(`✓ Superadmin claims set for user: ${email}`);
    
    // Verify the claims were set
    const updatedUser = await admin.auth().getUser(user.uid);
    console.log(`Claims for ${email}:`, updatedUser.customClaims);
    
    return true;
  } catch (error) {
    console.error(`✗ Failed to set claims for ${email}:`, error);
    return false;
  }
}

// Process all superadmin emails
async function processAllSuperadmins() {
  console.log("Setting superadmin claims for multiple users...");
  
  for (const email of superadminEmails) {
    console.log(`Processing: ${email}`);
    await setSuperadminClaims(email);
  }
  
  console.log("Finished setting superadmin claims");
}

// Execute the function to process all superadmins
processAllSuperadmins()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
