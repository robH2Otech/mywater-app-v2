
import * as admin from 'firebase-admin';

// Centralized Firebase Admin initialization to prevent conflicts
let adminApp: admin.app.App | null = null;

export const getAdminApp = (): admin.app.App => {
  if (!adminApp) {
    try {
      // Check if already initialized
      adminApp = admin.app();
    } catch (error) {
      // Initialize if not already done
      adminApp = admin.initializeApp();
      console.log('Firebase Admin SDK initialized successfully');
    }
  }
  return adminApp;
};

export const getFirestore = (): admin.firestore.Firestore => {
  const app = getAdminApp();
  return app.firestore();
};

export const getAuth = (): admin.auth.Auth => {
  const app = getAdminApp();
  return app.auth();
};
