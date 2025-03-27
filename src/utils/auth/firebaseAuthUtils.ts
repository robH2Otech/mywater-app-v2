
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  AuthProvider,
  signOut
} from "firebase/auth";
import { auth } from "@/integrations/firebase/client";

// Email Authentication
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw mapAuthErrorToMessage(error);
  }
};

// Social Authentication
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithSocialProvider(provider);
};

export const loginWithFacebook = async () => {
  const provider = new FacebookAuthProvider();
  return signInWithSocialProvider(provider);
};

const signInWithSocialProvider = async (provider: AuthProvider) => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    throw mapAuthErrorToMessage(error);
  }
};

// Sign out
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    return false;
  }
};

// Error handling
const mapAuthErrorToMessage = (error: any) => {
  const errorCode = error.code;
  let errorMessage = "Authentication failed";
  
  switch (errorCode) {
    case 'auth/invalid-email':
      errorMessage = "Invalid email address format";
      break;
    case 'auth/user-disabled':
      errorMessage = "This user account has been disabled";
      break;
    case 'auth/user-not-found':
      errorMessage = "No account found with this email";
      break;
    case 'auth/wrong-password':
      errorMessage = "Incorrect password";
      break;
    case 'auth/email-already-in-use':
      errorMessage = "An account already exists with this email";
      break;
    case 'auth/weak-password':
      errorMessage = "Password should be at least 6 characters";
      break;
    case 'auth/popup-closed-by-user':
      errorMessage = "Sign-in popup was closed before completing authentication";
      break;
    case 'auth/account-exists-with-different-credential':
      errorMessage = "An account already exists with the same email but different sign-in credentials";
      break;
    default:
      errorMessage = error.message || "An error occurred during authentication";
  }
  
  return new Error(errorMessage);
};
