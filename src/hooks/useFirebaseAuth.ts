
import { useState } from "react";
import { useAuthState } from "./firebase/useAuthState";
import { useEmailAuth } from "./firebase/useEmailAuth";
import { useSocialAuth } from "./firebase/useSocialAuth";

export function useFirebaseAuth() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const { user, authChecked } = useAuthState();
  const { 
    isLoading, 
    email, 
    password, 
    setEmail, 
    setPassword, 
    handleEmailAuth 
  } = useEmailAuth();
  const { socialLoading, handleSocialAuth } = useSocialAuth();
  
  const handleEmailSubmit = async (e: React.FormEvent) => {
    await handleEmailAuth(e, authMode);
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
    handleEmailAuth: handleEmailSubmit,
    handleSocialAuth,
    user,
    authChecked,
    isAuthenticated: !!user
  };
}
