
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { loginWithEmail, verifyPrivateUser, getAuthErrorMessage } from "@/utils/firebase/auth";

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
        const userCredential = await loginWithEmail(email, password);
        const user = userCredential.user;
        
        // Check if user exists in private users collection
        await verifyPrivateUser(user.uid);
        
        console.log("Private user signed in:", user);
        navigate("/private-dashboard");
      } else {
        toast({
          title: "Please complete the registration form",
          description: "We need a few more details to set up your account.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
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
