
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/integrations/firebase/client";
import { 
  RegisterUserData, 
  validateRegistrationForm, 
  checkEmailExists, 
  createUserAccount, 
  updateUserProfile,
  storeUserData,
  createReferralCode
} from "@/utils/auth/registerHelpers";

export function useRegisterFormHandler() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (userData: RegisterUserData) => {
    console.log("Starting registration process", {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.socialEmail || userData.email,
      address: userData.address,
      streetAddress: userData.streetAddress,
      city: userData.city,
      postalCode: userData.postalCode,
      country: userData.country,
      purifierModel: userData.purifierModel,
      hasPurchaseDate: !!userData.purchaseDate
    });
    
    // Validate form
    if (!validateRegistrationForm(userData)) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Check if email already exists
      const emailToCheck = userData.socialEmail || userData.email;
      console.log("Checking if email exists:", emailToCheck);
      const emailExists = await checkEmailExists(emailToCheck);
      
      if (emailExists) {
        console.log("Email already exists:", emailToCheck);
        throw new Error("An account with this email already exists");
      }
      
      // Determine if we're using social login or email/password
      let user;
      
      if (userData.socialEmail) {
        console.log("Using social login with email:", userData.socialEmail);
        // User is already authenticated via social login
        user = auth.currentUser;
        
        if (!user) {
          console.error("User session expired during social registration");
          throw new Error("User session expired. Please sign in again with social account.");
        }
        
        // Update user profile if needed
        console.log("Updating social user profile");
        await updateUserProfile(user, userData.firstName, userData.lastName);
      } else {
        console.log("Creating new user with email/password");
        try {
          // Create user account with email/password
          user = await createUserAccount(userData.email, userData.password);
          
          // Update display name
          await updateUserProfile(user, userData.firstName, userData.lastName);
          
          console.log("User created successfully:", user.uid);
        } catch (authError: any) {
          if (authError.code === 'auth/email-already-in-use') {
            console.log("Firebase Auth caught duplicate email that Firestore check missed");
            throw new Error("An account with this email already exists");
          }
          throw authError;
        }
      }
      
      console.log("Storing user data in Firestore");
      
      // Store user data in Firestore
      await storeUserData(userData, user.uid);
      
      // Create a unique referral code
      console.log("Creating referral code");
      await createReferralCode(user.uid, userData.firstName, userData.lastName);
      
      toast({
        title: "Account created successfully",
        description: "Welcome to MYWATER! You can now manage your water purification system.",
      });
      
      // Redirect to private dashboard
      navigate("/private-dashboard");
      
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleRegister
  };
}
