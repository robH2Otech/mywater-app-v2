
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCDSU2wD3hNl54z-HRuFXnWdsVbg1C6Ps",
  authDomain: "x-water-3b4eb.firebaseapp.com",
  projectId: "x-water-3b4eb",
  storageBucket: "x-water-3b4eb.appspot.com",
  messagingSenderId: "827472992283",
  appId: "1:827472992283:web:725af5703575d52aa0c0be",
  measurementId: "G-J3WN5VE34X"
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

// Handle Lovable domains
const isLovableDomain = currentDomain.includes('lovable.app') || currentDomain.includes('lovableproject.com');
if (isLovableDomain) {
  console.log("Lovable environment detected:", currentDomain);
}

// Enable local emulator if in development environment
if (import.meta.env.DEV) {
  const useEmulator = false; // Set to true to use Firebase emulators

  if (useEmulator) {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8080);
    connectStorageEmulator(storage, "localhost", 9199);
    console.log("Using Firebase emulator suite");
  }
}
