
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAh3g_3Xp9zewW-xyvOIEDnJGRaoMhJgqw",
  authDomain: "mywater-app-533f8.firebaseapp.com",
  databaseURL: "https://mywater-app-533f8-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mywater-app-533f8",
  storageBucket: "mywater-app-533f8.appspot.com",
  messagingSenderId: "1017703121603",
  appId: "1:1017703121603:web:77f5259b84a019a4429876"
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

// Enable local emulator if in development environment
if (import.meta.env.DEV) {
  // Check if we're in the Lovable preview domain
  const isLovableDomain = currentDomain.includes('lovableproject.com');
  const useEmulator = false; // Set to true to use Firebase emulators

  // For development in Lovable, we need to bypass the OAuth domain restriction
  if (isLovableDomain) {
    console.log("Lovable preview environment detected");
  }

  if (useEmulator) {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8080);
    connectStorageEmulator(storage, "localhost", 9199);
    console.log("Using Firebase emulator suite");
  }
}
