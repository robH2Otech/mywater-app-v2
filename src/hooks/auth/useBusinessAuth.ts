
import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";

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
      
      // Step 2: Look for user document by UID as document ID first
      const userDocRef = doc(db, "app_users_business", user.uid);
      let userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        console.log("✅ Business user document found by UID");
        return true;
      }
      
      // Step 3: If not found by UID, search by email to find existing document
      console.log("🔍 Searching for user by email in collection...");
      const usersQuery = query(
        collection(db, "app_users_business"),
        where("email", "==", email.toLowerCase())
      );
      const querySnapshot = await getDocs(usersQuery);
      
      if (!querySnapshot.empty) {
        // Found existing document with wrong ID - migrate it
        console.log("📋 Found existing user document, migrating to correct UID...");
        const existingDoc = querySnapshot.docs[0];
        const existingData = existingDoc.data();
        
        // Create new document with UID as document ID
        const newUserData = {
          id: user.uid,
          email: user.email || email,
          first_name: existingData.first_name || '',
          last_name: existingData.last_name || '',
          role: existingData.role || 'superadmin',
          company: existingData.company || 'mywater',
          status: existingData.status || 'active',
          created_at: existingData.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        await setDoc(userDocRef, newUserData);
        console.log("✅ User document migrated successfully");
        return true;
      }
      
      // Step 4: Check if this is a known superadmin email
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
          first_name: email.split('@')[0],
          last_name: '',
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
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("✅ Firebase user created, UID:", user.uid);
      
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
