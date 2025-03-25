
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";

interface RegisterFormHandlerProps {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  phone: string;
  purchaseDate: Date | null;
  purifierModel: string;
  password: string;
  confirmPassword: string;
  socialEmail?: string;
}

export function useRegisterFormHandler() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async ({
    firstName,
    lastName,
    email,
    address,
    phone,
    purchaseDate,
    purifierModel,
    password,
    confirmPassword,
    socialEmail = ""
  }: RegisterFormHandlerProps) => {
    console.log("Starting registration process", {
      firstName,
      lastName,
      email: socialEmail || email,
      address,
      purifierModel,
      hasPurchaseDate: !!purchaseDate
    });
    
    // Validate form
    if (!socialEmail && password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (!purifierModel) {
      toast({
        title: "Purifier model required",
        description: "Please select your water purifier model.",
        variant: "destructive",
      });
      return;
    }

    if (!purchaseDate) {
      toast({
        title: "Purchase date required",
        description: "Please select when you purchased your water purifier.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Determine if we're using social login or email/password
      let user;
      
      if (socialEmail) {
        console.log("Using social login with email:", socialEmail);
        // User is already authenticated via social login
        user = auth.currentUser;
        
        if (!user) {
          console.error("User session expired during social registration");
          throw new Error("User session expired. Please sign in again.");
        }
        
        // Update user profile if needed
        console.log("Updating social user profile");
        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`
        });
      } else {
        console.log("Creating new user with email/password");
        // Create user account with email/password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
        console.log("User created successfully:", user.uid);
      }
      
      // Calculate cartridge replacement date (1 year from purchase)
      const replacementDate = new Date(purchaseDate!);
      replacementDate.setFullYear(replacementDate.getFullYear() + 1);
      
      console.log("Storing user data in Firestore");
      
      // Store additional user data in app_users_privat collection
      const userData = {
        uid: user.uid,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        address: address,
        phone: phone,
        purifier_model: purifierModel,
        purchase_date: purchaseDate,
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
        const userDocRef = doc(db, "app_users_privat", user.uid);
        await setDoc(userDocRef, userData);
        console.log("User data stored successfully with UID as doc ID");
      } catch (error) {
        console.error("Error saving user with UID as doc ID, falling back to auto-ID:", error);
        // Fallback to auto-generated document ID
        await addDoc(collection(db, "app_users_privat"), userData);
        console.log("User data stored successfully with auto-generated ID");
      }
      
      // Create a unique referral code
      const referralCode = `${firstName.toLowerCase().substring(0, 3)}${lastName.toLowerCase().substring(0, 3)}${Math.floor(Math.random() * 10000)}`;
      
      console.log("Creating referral code:", referralCode);
      await addDoc(collection(db, "referral_codes"), {
        user_id: user.uid,
        code: referralCode,
        created_at: new Date()
      });
      
      toast({
        title: "Account created successfully",
        description: "Welcome to MYWATER! You can now manage your water purification system.",
      });
      
      // Redirect to private dashboard
      navigate("/private-dashboard");
      
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address format";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
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
