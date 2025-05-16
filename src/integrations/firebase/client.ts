
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Firebase configuration for your project
const firebaseConfig = {
  apiKey: "AIzaSyAh3g_3Xp9zewW-xyvOIEDnJGRaoMhJgqw",
  authDomain: "mywater-app-533f8.firebaseapp.com",
  projectId: "mywater-app-533f8",
  storageBucket: "mywater-app-533f8.appspot.com",
  messagingSenderId: "1054147575428",
  appId: "1:1054147575428:web:5e2b29b2a1fdc3ac476ef4",
  measurementId: "G-7KJHV47PJ5"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

// Set language before auth state is determined
auth.useDeviceLanguage();

// Current domain for debugging and authorization checks
export const currentDomain = window.location.hostname;
console.log("Current domain:", currentDomain);

// Immediately set to session persistence to prevent issues with iframe previews
(async () => {
  try {
    await setPersistence(auth, browserSessionPersistence);
    console.log("Auth persistence set to SESSION");
  } catch (err) {
    console.error("Error setting auth persistence:", err);
  }
})();

// Handle development domains
const isDevelopment = currentDomain === 'localhost' || currentDomain === '127.0.0.1';
if (isDevelopment) {
  console.log("Development environment detected:", currentDomain);
}

// Enable local emulator if in development environment and explicitly enabled
if (import.meta.env.DEV) {
  const useEmulator = false; // Set to true to use Firebase emulators

  if (useEmulator) {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8080);
    connectStorageEmulator(storage, "localhost", 9199);
    console.log("Using Firebase emulator suite");
  }
}
