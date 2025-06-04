
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Use the same Firebase config but create a separate app instance for user creation
const firebaseConfig = {
  apiKey: "AIzaSyAwSdp5xP6Yz9U1zD5gJ1wqGYYp8YGbpYE",
  authDomain: "wf-water-filtration.firebaseapp.com",
  projectId: "wf-water-filtration",
  storageBucket: "wf-water-filtration.firebasestorage.app",
  messagingSenderId: "1064074885451",
  appId: "1:1064074885451:web:11fe9b8e03e9d6b5df25e6",
  measurementId: "G-8PFTQX9YFN"
};

// Create a secondary Firebase app instance for admin operations
const secondaryApp = initializeApp(firebaseConfig, "secondary");
export const secondaryAuth = getAuth(secondaryApp);
