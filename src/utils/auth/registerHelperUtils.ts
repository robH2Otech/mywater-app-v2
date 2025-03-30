
import { toast } from "@/hooks/use-toast";
import { RegisterUserData } from "./registerHelpers";

/**
 * Validates user registration data
 */
export const validateUserData = (userData: RegisterUserData) => {
  if (!userData.firstName || !userData.lastName) {
    toast({
      title: "Missing information",
      description: "Please provide your first and last name.",
      variant: "destructive",
    });
    return false;
  }
  
  if (!userData.email && !userData.socialEmail) {
    toast({
      title: "Missing information",
      description: "Email address is required.",
      variant: "destructive",
    });
    return false;
  }
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailToValidate = userData.socialEmail || userData.email;
  
  if (!emailPattern.test(emailToValidate)) {
    toast({
      title: "Invalid email",
      description: "Please provide a valid email address.",
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
  
  if (!userData.socialEmail && userData.password.length < 6) {
    toast({
      title: "Password too short",
      description: "Password must be at least 6 characters long.",
      variant: "destructive",
    });
    return false;
  }

  if (!userData.phone) {
    toast({
      title: "Missing information",
      description: "Please provide your phone number.",
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
  
  if (!userData.streetAddress || !userData.city || !userData.postalCode || !userData.country) {
    toast({
      title: "Address information missing",
      description: "Please provide your complete address.",
      variant: "destructive",
    });
    return false;
  }
  
  return true;
};

/**
 * Handles authentication errors with user-friendly messages
 */
export const handleAuthErrors = (authError: any) => {
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
  
  return new Error(errorMessage);
};

/**
 * Prepares user data for storage in Firestore
 */
export const prepareUserDataForFirestore = (userData: RegisterUserData, uid: string) => {
  // Calculate cartridge replacement date (1 year from purchase)
  const replacementDate = new Date(userData.purchaseDate!);
  replacementDate.setFullYear(replacementDate.getFullYear() + 1);
  
  // Create user data object
  return {
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
    needs_profile_completion: false,
    registered_with: userData.socialEmail ? "social" : "email"
  };
};

/**
 * Generates a unique referral code
 */
export const generateReferralCode = (firstName: string, lastName: string) => {
  return `${firstName.toLowerCase().substring(0, 3)}${lastName.toLowerCase().substring(0, 3)}${Math.floor(Math.random() * 10000)}`;
};
