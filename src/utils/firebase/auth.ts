
import { 
  User,
  UserCredential,
  GoogleAuthProvider, 
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  browserSessionPersistence,
  setPersistence
} from "firebase/auth";
import { collection, getDocs, query, where, doc, setDoc } from "firebase/firestore";
import { auth, db, currentDomain } from "@/integrations/firebase/client";

/**
 * Firebase authentication utility functions
 */

// Email/Password Login
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

// Email/Password Registration
export const registerWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    console.log("Attempting email registration for:", email);
    
    // Set session persistence to prevent issues in iframe environments
    await setPersistence(auth, browserSessionPersistence);
    
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Email registration error:", error);
    throw error;
  }
};

// Social Authentication (Google)
export const loginWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  
  try {
    console.log("Attempting Google login with domain:", currentDomain);
    
    // Set session persistence to prevent issues in iframe environments
    await setPersistence(auth, browserSessionPersistence);
    
    return await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};

// Social Authentication (Facebook)
export const loginWithFacebook = async (): Promise<UserCredential> => {
  const provider = new FacebookAuthProvider();
  provider.setCustomParameters({
    display: 'popup'
  });
  
  try {
    console.log("Attempting Facebook login with domain:", currentDomain);
    
    // Set session persistence to prevent issues in iframe environments
    await setPersistence(auth, browserSessionPersistence);
    
    return await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Facebook login error:", error);
    throw error;
  }
};

// Sign Out
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Verify if user exists in private users collection
export const verifyPrivateUser = async (uid: string): Promise<boolean> => {
  try {
    console.log("Verifying private user with UID:", uid);
    // Check if user exists in app_users_privat collection
    const privateUsersRef = collection(db, "app_users_privat");
    const q = query(privateUsersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Check old collection as fallback
      const oldPrivateUsersRef = collection(db, "private_users");
      const oldQuery = query(oldPrivateUsersRef, where("uid", "==", uid));
      const oldSnapshot = await getDocs(oldQuery);
      
      if (oldSnapshot.empty) {
        console.log("User not found in any collection");
        return false;
      } else {
        console.log("User found in old private_users collection, migrating...");
        // Migrate to new collection - use UID as document ID for easier retrieval
        const userData = oldSnapshot.docs[0].data();
        await setDoc(doc(db, "app_users_privat", uid), {
          ...userData,
          migrated_at: new Date()
        });
        return true;
      }
    }
    
    console.log("User found in app_users_privat collection");
    return true;
  } catch (error) {
    console.error("Error verifying private user:", error);
    throw error;
  }
};

// Handle Social User Data
export const handleSocialUserData = async (user: User, provider: string): Promise<void> => {
  try {
    console.log("Handling social user data for:", user.uid, "Provider:", provider);
    if (!user.uid) {
      throw new Error("Invalid user object: missing UID");
    }
    
    // First check if user already exists in app_users_privat collection
    const privateUsersRef = collection(db, "app_users_privat");
    const q = query(privateUsersRef, where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    
    // Also try getting the user directly by UID as document ID
    let userDocExists = false;
    try {
      const userDocRef = doc(db, "app_users_privat", user.uid);
      const userDocSnap = await getDocs(query(privateUsersRef, where("__name__", "==", user.uid)));
      userDocExists = !userDocSnap.empty;
    } catch (error) {
      console.error("Error checking for user doc by ID:", error);
    }
    
    if (querySnapshot.empty && !userDocExists) {
      console.log("User not found in database, creating temporary profile");
      
      // Extract user info from social login
      const name = user.displayName || '';
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // Create temporary user data - will need to be completed with registration form
      // Use UID as document ID for easier retrieval
      await setDoc(doc(db, "app_users_privat", user.uid), {
        uid: user.uid,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        created_at: new Date(),
        auth_provider: provider,
        needs_profile_completion: true  // Flag to indicate registration needs to be completed
      });
    } else {
      console.log("User already exists in app_users_privat collection");
    }
  } catch (error) {
    console.error("Error handling social user data:", error);
    throw error;
  }
};

// Parse Firebase authentication errors
export const getAuthErrorMessage = (error: any): string => {
  console.log("Processing auth error:", error.code, error.message);
  let errorMessage = "Authentication failed";
  
  if (error.code === 'auth/invalid-email') {
    errorMessage = "Invalid email address format";
  } else if (error.code === 'auth/user-disabled') {
    errorMessage = "This account has been disabled";
  } else if (error.code === 'auth/user-not-found') {
    errorMessage = "No account with this email exists";
  } else if (error.code === 'auth/wrong-password') {
    errorMessage = "Incorrect password";
  } else if (error.code === 'auth/email-already-in-use') {
    errorMessage = "An account with this email already exists";
  } else if (error.code === 'auth/weak-password') {
    errorMessage = "Password should be at least 6 characters";
  } else if (error.code === 'auth/account-exists-with-different-credential') {
    errorMessage = "An account already exists with the same email but different sign-in credentials.";
  } else if (error.code === 'auth/cancelled-popup-request') {
    errorMessage = "The sign-in popup was closed before completing authentication.";
  } else if (error.code === 'auth/popup-blocked') {
    errorMessage = "The sign-in popup was blocked by your browser.";
  } else if (error.code === 'auth/popup-closed-by-user') {
    errorMessage = "The sign-in popup was closed before completing authentication.";
  } else if (error.code === 'auth/unauthorized-domain') {
    errorMessage = `This domain (${currentDomain}) is not authorized for OAuth operations. Please contact support.`;
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  return errorMessage;
};
