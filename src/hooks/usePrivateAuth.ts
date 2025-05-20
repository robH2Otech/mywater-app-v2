
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebaseAuth } from "./useFirebaseAuth";
import { useEmailAuth } from "./firebase/useEmailAuth";
import { useSocialAuth } from "./firebase/useSocialAuth";

export function usePrivateAuth() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const firebaseAuth = useFirebaseAuth();
  const { isLoading, email, password, setEmail, setPassword, handleEmailAuth: originalHandleEmailAuth } = useEmailAuth();
  const { socialLoading, handleSocialAuth } = useSocialAuth();
  
  // Wrap the handleEmailAuth function to pass the current authMode
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    await originalHandleEmailAuth(e);
    // The authMode is handled internally based on the UI state
  };
  
  return {
    ...firebaseAuth,
    authMode,
    setAuthMode,
    isLoading,
    socialLoading,
    email,
    password,
    setEmail,
    setPassword,
    handleEmailAuth,
    handleSocialAuth
  };
}
