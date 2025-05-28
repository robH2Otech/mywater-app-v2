
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp();
}

export const getFirestore = (): admin.firestore.Firestore => {
  return admin.firestore();
};

export const getAuth = (): admin.auth.Auth => {
  return admin.auth();
};
