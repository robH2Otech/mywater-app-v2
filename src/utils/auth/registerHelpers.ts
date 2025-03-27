
import { toast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";

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
  if (!userData.firstName || !userData.lastName) {
    toast({
      title: "Missing information",
      description: "Please provide your first and last name.",
      variant: "destructive",
    });
    return false;
  }
  
  if (!userData.socialEmail && (!userData.password || userData.password !== userData.confirmPassword)) {
    toast({
      title: "Password error",
      description: "Please make sure your passwords match.",
      variant: "destructive",
    });
    return false;
  }

  if (!userData.purifierModel) {
    toast({
      title: "Purifier model required",
      description: "Please select your water purifier model.",
      variant: "destructive",
    });
    return false;
  }

  if (!userData.purchaseDate) {
    toast({
      title: "Purchase date required",
      description: "Please select when you purchased your water purifier.",
      variant: "destructive",
    });
    return false;
  }
  
  return true;
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
    console.error("Auth error during registration:", authError);
    let errorMessage = "Failed to create account";
    
    if (authError.code === 'auth/email-already-in-use') {
      errorMessage = "An account with this email already exists";
    } else if (authError.code === 'auth/invalid-email') {
      errorMessage = "Invalid email address format";
    } else if (authError.code === 'auth/weak-password') {
      errorMessage = "Password should be at least 6 characters";
    } else if (authError.message) {
      errorMessage = authError.message;
    }
    
    throw new Error(errorMessage);
  }
};

export const updateUserProfile = async (user: any, firstName: string, lastName: string) => {
  await updateProfile(user, {
    displayName: `${firstName} ${lastName}`
  });
};

export const storeUserData = async (userData: RegisterUserData, uid: string) => {
  // Calculate cartridge replacement date (1 year from purchase)
  const replacementDate = new Date(userData.purchaseDate!);
  replacementDate.setFullYear(replacementDate.getFullYear() + 1);
  
  // Store additional user data in app_users_privat collection
  const firestoreData = {
    uid,
    email: userData.socialEmail || userData.email,
    first_name: userData.firstName,
    last_name: userData.lastName,
    address: userData.address || "",
    street_address: userData.streetAddress || "",
    city: userData.city || "",
    postal_code: userData.postalCode || "",
    country: userData.country || "",
    phone: userData.phone,
    purifier_model: userData.purifierModel,
    purchase_date: userData.purchaseDate,
    cartridge_replacement_date: replacementDate,
    referrals_count: 0,
    referrals_converted: 0,
    referral_reward_earned: false,
    referral_reward_claimed: false,
    created_at: new Date(),
    updated_at: new Date(),
    needs_profile_completion: false
  };
  
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
  const referralCode = `${firstName.toLowerCase().substring(0, 3)}${lastName.toLowerCase().substring(0, 3)}${Math.floor(Math.random() * 10000)}`;
  
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
