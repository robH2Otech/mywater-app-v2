
import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";
import { refreshUserClaims } from "@/utils/admin/adminClaimsManager";

export function useBusinessAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const loginUser = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log("Starting login process for:", email);
      
      // Step 1: Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Firebase authentication successful, UID:", user.uid);
      
      // Step 2: Check if user document exists
      const userDocRef = doc(db, "app_users_business", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        console.log("User document found");
        const userData = userDoc.data();
        
        // Step 3: Ensure user has company field (for superadmins)
        if (!userData.company && userData.role === 'superadmin') {
          console.log("Adding company field for superadmin");
          await setDoc(userDocRef, {
            ...userData,
            company: 'mywater',
            updated_at: new Date().toISOString()
          });
        }
        
        // Step 4: Refresh user claims
        await refreshUserClaims();
        
        return true;
      } else {
        console.error("User document not found in app_users_business");
        await auth.signOut();
        throw new Error("You don't have access to the business section. Please contact support.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log("Starting registration process for:", email);
      
      // Step 1: Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Firebase user created, UID:", user.uid);
      
      // Step 2: Create user document with company field
      await setDoc(doc(db, "app_users_business", user.uid), {
        id: user.uid,
        email: user.email,
        first_name: "",
        last_name: "",
        role: "user",
        company: "mywater", // Default company
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      console.log("User document created successfully");
      return true;
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loginUser,
    registerUser,
    isLoading
  };
}

function getAuthErrorMessage(error: any): string {
  const errorCode = error.code;
  
  switch (errorCode) {
    case 'auth/invalid-email':
      return "Invalid email address format";
    case 'auth/user-disabled':
      return "This account has been disabled";
    case 'auth/user-not-found':
      return "No account with this email exists";
    case 'auth/wrong-password':
      return "Incorrect password";
    case 'auth/email-already-in-use':
      return "An account with this email already exists";
    case 'auth/weak-password':
      return "Password should be at least 6 characters";
    case 'auth/invalid-credential':
      return "Invalid email or password";
    default:
      return error.message || "Authentication failed";
  }
}
