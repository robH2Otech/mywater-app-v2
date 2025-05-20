
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebaseAuth } from "./useFirebaseAuth";
import { useEmailAuth } from "./firebase/useEmailAuth";
import { useSocialAuth } from "./firebase/useSocialAuth";

export function usePrivateAuth() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const firebaseAuth = useFirebaseAuth();
  const { isLoading, email, password, setEmail, setPassword, handleEmailAuth } = useEmailAuth();
  const { socialLoading, handleSocialAuth } = useSocialAuth();
  
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
