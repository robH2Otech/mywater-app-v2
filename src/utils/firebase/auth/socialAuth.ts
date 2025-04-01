
import { 
  UserCredential,
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithPopup,
  browserSessionPersistence,
  setPersistence,
  User
} from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc,
  getDoc,
  Timestamp 
} from "firebase/firestore";
import { auth, db, currentDomain } from "@/integrations/firebase/client";

/**
 * Social Authentication (Google)
 */
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

/**
 * Social Authentication (Facebook)
 */
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

/**
 * Handle Social User Data
 */
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
  } catch (error) {
    console.error("Error handling social user data:", error);
    throw error;
  }
};
