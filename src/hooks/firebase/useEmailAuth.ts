
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  loginWithEmail, 
  verifyPrivateUser, 
  getAuthErrorMessage 
} from "@/utils/firebase/auth";

/**
 * Hook to handle email-based authentication
 */
export function useEmailAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userDisplayName, setUserDisplayName] = useState("");
  
  const handleEmailAuth = async (e: React.FormEvent, authMode: "login" | "register") => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (authMode === "login") {
        console.log("Logging in with email:", email);
        const userCredential = await loginWithEmail(email, password);
        const user = userCredential.user;
        
        // Check if user exists in private users collection
        // The collection name is "app_users_privat" in Firebase
        const isPrivateUser = await verifyPrivateUser(user.uid);
        
        if (!isPrivateUser) {
          // Force logout since user is not verified
          await userCredential.user.delete().catch(err => console.error("Error deleting unregistered user", err));
          throw new Error("Account not found. Please register first.");
        }
        
        console.log("Private user signed in:", user.uid);
        // Store user display name from the auth object if available
        if (user.displayName) {
          setUserDisplayName(user.displayName);
          // Store in session storage for persistence
          sessionStorage.setItem('userDisplayName', user.displayName);
        }
        
        navigate("/private-dashboard");
      } else if (authMode === "register") {
        console.log("Starting registration with email");
        // We'll redirect to the registration form to complete profile
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
    userDisplayName,
    setEmail,
    setPassword,
    handleEmailAuth
  };
}
