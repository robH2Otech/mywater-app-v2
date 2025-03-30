
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
  setPersistence,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  setDoc, 
  getDoc,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
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

// Social Authentication (Google)
export const loginWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  
  // Always force account selection to avoid silent login issues
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
  
  // Force popup display to ensure consistent behavior
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
    
    if (!uid) {
      console.error("Invalid UID provided for verification");
      return false;
    }
    
    // First try getting the user directly by UID as document ID (most efficient)
    try {
      const userDocRef = doc(db, "app_users_privat", uid);
      const userSnapshot = await getDoc(userDocRef);
      
      if (userSnapshot.exists()) {
        console.log("User found by direct UID lookup");
        return true;
      }
    } catch (error) {
      console.log("Direct UID lookup failed, falling back to query");
    }
    
    // Check if user exists in app_users_privat collection using a query
    const privateUsersRef = collection(db, "app_users_privat");
    const q = query(privateUsersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      console.log("User found in app_users_privat collection by query");
      
      // For performance reasons, we should update the document ID to match the UID
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      // If the document ID is not the same as UID, create a new document with UID as ID
      if (userDoc.id !== uid) {
        console.log("Updating user document to use UID as document ID");
        await setDoc(doc(db, "app_users_privat", uid), {
          ...userData,
          updated_at: new Date()
        });
      }
      
      return true;
    }
    
    // Check old collection as fallback
    const oldPrivateUsersRef = collection(db, "private_users");
    const oldQuery = query(oldPrivateUsersRef, where("uid", "==", uid));
    const oldSnapshot = await getDocs(oldQuery);
    
    if (!oldSnapshot.empty) {
      console.log("User found in old private_users collection, migrating...");
      // Migrate to new collection - use UID as document ID for easier retrieval
      const userData = oldSnapshot.docs[0].data();
      await setDoc(doc(db, "app_users_privat", uid), {
        ...userData,
        migrated_at: new Date(),
        updated_at: new Date()
      });
      return true;
    }
    
    console.log("User not found in any collection");
    return false;
  } catch (error) {
    console.error("Error verifying private user:", error);
    return false;
  }
};

// Handle Social User Data
export const handleSocialUserData = async (user: User, provider: string): Promise<void> => {
  try {
    console.log("Handling social user data for:", user.uid, "Provider:", provider);
    if (!user.uid) {
      throw new Error("Invalid user object: missing UID");
    }
    
    // First check if user already exists by UID as document ID
    try {
      const userDocRef = doc(db, "app_users_privat", user.uid);
      const userSnapshot = await getDoc(userDocRef);
      
      if (userSnapshot.exists()) {
        console.log("User document found by UID");
        return;
      }
    } catch (error) {
      console.log("Direct UID lookup failed, continuing with query");
    }
    
    // Also check by uid field
    const privateUsersRef = collection(db, "app_users_privat");
    const q = query(privateUsersRef, where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
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
        updated_at: new Date(),
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
