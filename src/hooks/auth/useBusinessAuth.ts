
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
      console.log("🔐 Starting login process for:", email);
      
      // Step 1: Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("✅ Firebase authentication successful, UID:", user.uid);
      
      // Step 2: Check if user document exists in business collection
      const userDocRef = doc(db, "app_users_business", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        console.log("✅ Business user document found");
        const userData = userDoc.data();
        
        // Step 3: Ensure user has required fields (with fallbacks)
        const updatedData = {
          id: user.uid,
          email: user.email || email,
          first_name: userData.first_name || user.displayName?.split(' ')[0] || '',
          last_name: userData.last_name || user.displayName?.split(' ').slice(1).join(' ') || '',
          role: userData.role || 'user',
          company: userData.company || 'mywater',
          status: userData.status || 'active',
          created_at: userData.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...userData
        };
        
        // Update document if any fields were missing
        if (JSON.stringify(userData) !== JSON.stringify(updatedData)) {
          console.log("🔄 Updating user document with missing fields");
          await setDoc(userDocRef, updatedData);
        }
        
        // Step 4: Try to refresh user claims (non-blocking)
        try {
          await refreshUserClaims();
          console.log("✅ User claims refreshed");
        } catch (claimsError) {
          console.log("⚠️ Claims refresh failed (non-critical):", claimsError);
        }
        
        return true;
      } else {
        console.log("❌ User document not found in app_users_business");
        
        // Check if this is a known superadmin email
        const superadminEmails = [
          'rob.istria@gmail.com',
          'robert.slavec@gmail.com', 
          'aljaz.slavec@gmail.com'
        ];
        
        if (superadminEmails.includes(email.toLowerCase())) {
          console.log("🔧 Creating superadmin user document for:", email);
          
          await setDoc(userDocRef, {
            id: user.uid,
            email: user.email || email,
            first_name: user.displayName?.split(' ')[0] || email.split('@')[0],
            last_name: user.displayName?.split(' ').slice(1).join(' ') || '',
            role: 'superadmin',
            company: 'mywater',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
          console.log("✅ Superadmin user document created");
          return true;
        } else {
          await auth.signOut();
          throw new Error("You don't have access to the business section. Please contact support.");
        }
      }
    } catch (error: any) {
      console.error("❌ Login error:", error);
      throw new Error(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log("📝 Starting registration process for:", email);
      
      // Step 1: Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("✅ Firebase user created, UID:", user.uid);
      
      // Step 2: Create user document with required fields
      await setDoc(doc(db, "app_users_business", user.uid), {
        id: user.uid,
        email: user.email || email,
        first_name: "",
        last_name: "",
        role: "user",
        company: "mywater",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      console.log("✅ User document created successfully");
      return true;
    } catch (error: any) {
      console.error("❌ Registration error:", error);
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
    case 'auth/too-many-requests':
      return "Too many failed attempts. Please try again later";
    case 'auth/network-request-failed':
      return "Network error. Please check your connection";
    default:
      return error.message || "Authentication failed";
  }
}
