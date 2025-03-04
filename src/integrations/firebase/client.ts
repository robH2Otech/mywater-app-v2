
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAh3g_3Xp9zewW-xyvOIEDnJGRaoMhJgqw",
  authDomain: "mywater-app-533f8.firebaseapp.com",
  databaseURL: "https://mywater-app-533f8-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mywater-app-533f8",
  storageBucket: "mywater-app-533f8.firebasestorage.app",
  messagingSenderId: "1017703121603",
  appId: "1:1017703121603:web:77f5259b84a019a4429876"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
