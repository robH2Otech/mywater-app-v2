
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";
import { 
  loginWithEmail, 
  loginWithGoogle, 
  loginWithFacebook, 
  verifyPrivateUser, 
  handleSocialUserData,
  getAuthErrorMessage 
} from "@/utils/firebase/auth";

export function useFirebaseAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Check if user is already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/private-dashboard");
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);
  
  const handleEmailAuth = async (e: React.FormEvent) => {
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
  
  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    try {
      let result;
      
      if (provider === 'google') {
        result = await loginWithGoogle();
      } else {
        result = await loginWithFacebook();
      }
      
      // Get user info from credential
      const user = result.user;
      await handleSocialUserData(user, provider);
      
      // Navigate to the dashboard after successful sign-in or registration
      navigate("/private-dashboard");
    } catch (error: any) {
      console.error("Social auth error:", error);
      const errorMessage = getAuthErrorMessage(error);
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSocialLoading(null);
    }
  };
  
  return {
    isLoading,
    socialLoading,
    authMode,
    email,
    password,
    setAuthMode,
    setEmail,
    setPassword,
    handleEmailAuth,
    handleSocialAuth
  };
}
