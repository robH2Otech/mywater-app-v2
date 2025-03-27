
import { toast } from "@/hooks/use-toast";
import { auth, db } from "@/integrations/firebase/client";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { 
  validateUserData, 
  handleAuthErrors,
  prepareUserDataForFirestore,
  generateReferralCode
} from "./registerHelperUtils";

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
  const usersRef = collection(db, "app_users_privat");
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);
  
  return !querySnapshot.empty;
};

export const createUserAccount = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (authError: any) {
    throw handleAuthErrors(authError);
  }
};

export const updateUserProfile = async (user: any, firstName: string, lastName: string) => {
  await updateProfile(user, {
    displayName: `${firstName} ${lastName}`
  });
};

export const storeUserData = async (userData: RegisterUserData, uid: string) => {
  const firestoreData = prepareUserDataForFirestore(userData, uid);
  
  // Use user.uid as the document ID for easier retrieval
  try {
    const userDocRef = doc(db, "app_users_privat", uid);
    await setDoc(userDocRef, firestoreData);
    return firestoreData;
  } catch (firestoreError) {
    console.error("Error saving user data to Firestore:", firestoreError);
    throw new Error("Failed to save your profile. Please try again.");
  }
};

export const createReferralCode = async (userId: string, firstName: string, lastName: string) => {
  const referralCode = generateReferralCode(firstName, lastName);
  
  try {
    const referralDocRef = doc(collection(db, "referral_codes"));
    await setDoc(referralDocRef, {
      user_id: userId,
      code: referralCode,
      created_at: new Date()
    });
    return referralCode;
  } catch (referralError) {
    console.error("Error creating referral code:", referralError);
    return null;
  }
};
