
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where, setDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";

interface BusinessAuthFormProps {
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
}

export function BusinessAuthForm({ isLogin, setIsLogin }: BusinessAuthFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        console.log("Attempting to sign in with email:", email);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log("Firebase user authenticated, UID:", user.uid);
        
        // Primary method: Check using UID as document ID
        const userDocRef = doc(db, "app_users_business", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          console.log("User found in app_users_business by UID:", user.uid);
          const userData = userDoc.data();
          console.log("User data:", userData);
          
          toast({
            title: "Success",
            description: "Welcome back! Redirecting to dashboard...",
          });
          
          navigate("/dashboard");
          return;
        }
        
        console.log("User not found by UID, checking by email as fallback...");
        
        // Fallback: check by email in case of old data structure
        const businessUsersRef = collection(db, "app_users_business");
        const emailQuery = query(businessUsersRef, where("email", "==", user.email));
        const emailQuerySnapshot = await getDocs(emailQuery);
        
        if (!emailQuerySnapshot.empty) {
          console.log("User found by email, migrating to UID-based document...");
          const userData = emailQuerySnapshot.docs[0].data();
          console.log("User data from email query:", userData);
          
          // Migrate to UID-based document
          await setDoc(doc(db, "app_users_business", user.uid), {
            ...userData,
            id: user.uid,
            email: user.email,
            migrated_at: new Date().toISOString(),
          });
          
          toast({
            title: "Success", 
            description: "Welcome back! Account migrated successfully.",
          });
          
          navigate("/dashboard");
          return;
        }
        
        // Check app_users for migration
        console.log("Checking app_users collection for migration...");
        const usersRef = collection(db, "app_users");
        const usersQuery = query(usersRef, where("email", "==", user.email));
        const usersSnapshot = await getDocs(usersQuery);
        
        if (!usersSnapshot.empty) {
          console.log("User found in app_users, migrating to app_users_business...");
          const userData = usersSnapshot.docs[0].data();
          
          // Migrate user to app_users_business using UID as document ID
          await setDoc(doc(db, "app_users_business", user.uid), {
            ...userData,
            id: user.uid,
            email: user.email,
            migrated_at: new Date().toISOString(),
          });
          
          console.log("User migrated successfully");
          
          toast({
            title: "Success",
            description: "Account migrated successfully. Welcome back!",
          });
          
          navigate("/dashboard");
          return;
        }
        
        // No user found anywhere
        console.error("User not found in any collection");
        toast({
          title: "Access Denied",
          description: "You don't have access to the business section. Please contact support if you believe this is an error.",
          variant: "destructive",
        });
        
        // Sign out the user since they don't have access
        await auth.signOut();
        
      } else {
        // Registration flow
        console.log("Creating new user account...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log("New user created, UID:", user.uid);
        
        // Create user document using UID as document ID (FIXED: use setDoc instead of addDoc)
        await setDoc(doc(db, "app_users_business", user.uid), {
          id: user.uid,
          email: user.email,
          first_name: "",
          last_name: "",
          role: "user",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        console.log("User document created successfully");
        
        toast({
          title: "Success",
          description: "Business account created successfully. You may now sign in.",
        });
        
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let errorMessage = "Authentication failed";
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address format";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "No account with this email exists";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters";
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password";
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

  return (
    <form onSubmit={handleAuth} className="space-y-6">
      <FormInput
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        required
      />
      <FormInput
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        required
        minLength={6}
      />

      <Button
        type="submit"
        className="w-full bg-mywater-blue hover:bg-mywater-blue/90"
        disabled={isLoading}
      >
        {isLoading
          ? "Loading..."
          : isLogin
          ? "Sign In"
          : "Create Account"}
      </Button>
    </form>
  );
}
