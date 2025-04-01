
import { 
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  browserSessionPersistence,
  setPersistence,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { auth, currentDomain } from "@/integrations/firebase/client";
import { getAuthErrorMessage } from "./authErrors";

/**
 * Email/Password Login
 */
export const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    console.log("Attempting email login for:", email);
    
    // Set session persistence to prevent issues in iframe environments
    await setPersistence(auth, browserSessionPersistence);
    
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Email login error:", error);
    throw error;
  }
};

/**
 * Email/Password Registration
 */
export const registerWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    console.log("Attempting email registration for:", email);
    
    // First check if this email is already in use
    const signInMethods = await fetchSignInMethodsForEmail(auth, email.toLowerCase().trim());
    if (signInMethods && signInMethods.length > 0) {
      throw new Error("An account with this email already exists");
    }
    
    // Set session persistence to prevent issues in iframe environments
    await setPersistence(auth, browserSessionPersistence);
    
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Email registration error:", error);
    throw error;
  }
};

/**
 * Check if email exists in Firebase Auth
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const signInMethods = await fetchSignInMethodsForEmail(auth, email.toLowerCase().trim());
    return signInMethods && signInMethods.length > 0;
  } catch (error) {
    console.error("Error checking email existence:", error);
    return false;
  }
};
