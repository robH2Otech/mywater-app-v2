
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { useToast } from "@/hooks/use-toast";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Check if user exists in business collection
        const businessUsersRef = collection(db, "app_users_business");
        const q = query(businessUsersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          // If not found, check app_users as fallback and migrate if found
          const usersRef = collection(db, "app_users");
          const usersQuery = query(usersRef, where("email", "==", user.email));
          const usersSnapshot = await getDocs(usersQuery);
          
          if (!usersSnapshot.empty) {
            // Migrate the user to app_users_business
            const userData = usersSnapshot.docs[0].data();
            await addDoc(collection(db, "app_users_business"), {
              ...userData,
              email: user.email,
              migrated_at: new Date().toISOString(),
            });
            
            console.log("User migrated during login:", user.email);
            navigate("/dashboard");
            return;
          }
          
          toast({
            title: "Access Denied",
            description: "You don't have access to the business section.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        console.log("Business user signed in:", user);
        navigate("/dashboard");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await addDoc(collection(db, "app_users_business"), {
          id: user.uid,
          email: user.email,
          first_name: "",
          last_name: "",
          role: "user",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
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
