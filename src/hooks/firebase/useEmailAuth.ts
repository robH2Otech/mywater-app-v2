
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { loginWithEmail, registerWithEmail, verifyPrivateUser, getAuthErrorMessage } from "@/utils/firebase/auth";

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
        console.log("🔐 Logging in with email:", email);
        const userCredential = await loginWithEmail(email, password);
        const user = userCredential.user;
        
        console.log("✅ Firebase authentication successful for private user:", user.uid);
        
        // Check if user exists in private users collection
        const isPrivateUser = await verifyPrivateUser(user.uid);
        
        if (!isPrivateUser) {
          console.log("❌ User not found in private collection, creating default document");
          
          // Instead of deleting the user, create a default private user document
          const { doc, setDoc } = await import("firebase/firestore");
          const { db } = await import("@/integrations/firebase/client");
          
          await setDoc(doc(db, "app_users_privat", user.uid), {
            uid: user.uid,
            email: user.email || email,
            first_name: user.displayName?.split(' ')[0] || email.split('@')[0],
            last_name: user.displayName?.split(' ').slice(1).join(' ') || '',
            created_at: new Date(),
            updated_at: new Date(),
            auth_provider: 'email',
            needs_profile_completion: true
          });
          
          console.log("✅ Created default private user document");
        }
        
        // Store user display name from the auth object if available
        if (user.displayName) {
          setUserDisplayName(user.displayName);
          sessionStorage.setItem('userDisplayName', user.displayName);
        }
        
        console.log("🏠 Navigating to private dashboard");
        navigate("/private-dashboard");
      } else if (authMode === "register") {
        console.log("📝 Starting registration with email");
        toast({
          title: "Please complete registration",
          description: "Fill in your details to create your account",
        });
      }
    } catch (error: any) {
      console.error("❌ Auth error:", error);
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
