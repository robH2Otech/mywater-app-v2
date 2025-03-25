
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { loginWithEmail, registerWithEmail, verifyPrivateUser, getAuthErrorMessage } from "@/utils/firebase/auth";

/**
 * Hook to handle email-based authentication
 */
export function useEmailAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleEmailAuth = async (e: React.FormEvent, authMode: "login" | "register") => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (authMode === "login") {
        console.log("Logging in with email:", email);
        const userCredential = await loginWithEmail(email, password);
        const user = userCredential.user;
        
        // Check if user exists in private users collection
        const isPrivateUser = await verifyPrivateUser(user.uid);
        
        if (!isPrivateUser) {
          throw new Error("Account not found. Please register first.");
        }
        
        console.log("Private user signed in:", user.uid);
        navigate("/private-dashboard");
      } else if (authMode === "register") {
        console.log("Starting registration with email");
        // We'll redirect to the registration form to complete profile
        // instead of creating the user here
        toast({
          title: "Please complete registration",
          description: "Fill in your details to create your account",
        });
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      const errorMessage = getAuthErrorMessage(error);
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    email,
    password,
    setEmail,
    setPassword,
    handleEmailAuth
  };
}
