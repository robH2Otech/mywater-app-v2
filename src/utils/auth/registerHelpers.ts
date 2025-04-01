import { toast } from "@/hooks/use-toast";
import { auth, db } from "@/integrations/firebase/client";
import { collection, doc, getDocs, query, setDoc, where, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile, fetchSignInMethodsForEmail } from "firebase/auth";
import { 
  validateUserData, 
  handleAuthErrors,
  prepareUserDataForFirestore,
  generateReferralCode
} from "./registerHelperUtils";
import { checkEmailExists as checkFirebaseEmailExists } from "@/utils/firebase/auth";

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  address?: string;
  streetAddress?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone: string;
  purchaseDate: Date | null;
  purifierModel: string;
  password: string;
  confirmPassword: string;
  socialEmail?: string;
}

export const validateRegistrationForm = (userData: RegisterUserData) => {
  return validateUserData(userData);
};

export const checkEmailExists = async (email: string) => {
  console.log("Checking if email exists:", email);
  
  if (!email) {
    console.error("Empty email provided to checkEmailExists");
    return false;
  }
  
  try {
    // First check in Firebase Auth directly - this is the most reliable method
    const authEmailExists = await checkFirebaseEmailExists(email);
    if (authEmailExists) {
      console.log("Email exists in Firebase Auth:", email);
      return true;
    }
    
    // Then check in Firestore collections
    const emailToCheck = email.toLowerCase().trim();
    
    // Check in app_users_privat collection (fix the typo)
    const usersRef = collection(db, "app_users_privat");
    const q = query(usersRef, where("email", "==", emailToCheck));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      console.log("Email exists in app_users_privat collection:", email);
      return true;
    }
    
    // Check in alternate collections for legacy support
    const privateUsersRef = collection(db, "private_users");
    const q2 = query(privateUsersRef, where("email", "==", emailToCheck));
    const querySnapshot2 = await getDocs(q2);
    
    if (!querySnapshot2.empty) {
      console.log("Email exists in private_users collection:", email);
      return true;
    }
    
    // If we got here, email doesn't exist
    console.log("Email does not exist in any collection:", email);
    return false;
  } catch (error) {
    console.error("Error checking email existence:", error);
    // In case of error, we'll err on the side of caution and allow registration
    return false;
  }
};

export const createUserAccount = async (email: string, password: string) => {
  try {
    console.log("Creating user account for email:", email);
    const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
    console.log("User account created successfully");
    return userCredential.user;
  } catch (authError: any) {
    console.error("Error creating user account:", authError);
    throw handleAuthErrors(authError);
  }
};

export const updateUserProfile = async (user: any, firstName: string, lastName: string) => {
  await updateProfile(user, {
    displayName: `${firstName} ${lastName}`
  });
  console.log("User profile updated with display name:", `${firstName} ${lastName}`);
};

export const storeUserData = async (userData: RegisterUserData, uid: string) => {
  const firestoreData = prepareUserDataForFirestore(userData, uid);
  
  // Use user.uid as the document ID for easier retrieval
  try {
    console.log("Storing user data in Firestore, uid:", uid);
    // Fix the typo in the collection name
    const userDocRef = doc(db, "app_users_privat", uid);
    await setDoc(userDocRef, firestoreData);
    console.log("User data stored successfully");
    return firestoreData;
  } catch (firestoreError) {
    console.error("Error saving user data to Firestore:", firestoreError);
    throw new Error("Failed to save your profile. Please try again.");
  }
};

export const createReferralCode = async (userId: string, firstName: string, lastName: string) => {
  const referralCode = generateReferralCode(firstName, lastName);
  
  try {
    console.log("Creating referral code for user:", userId);
    const referralDocRef = doc(collection(db, "referral_codes"));
    await setDoc(referralDocRef, {
      user_id: userId,
      code: referralCode,
      created_at: new Date()
    });
    console.log("Referral code created:", referralCode);
    return referralCode;
  } catch (referralError) {
    console.error("Error creating referral code:", referralError);
    return null;
  }
};
