
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface WelcomeMessageProps {
  firstName?: string;
}

export function WelcomeMessage({ firstName }: WelcomeMessageProps) {
  const [userName, setUserName] = useState<string>("");
  const { currentUser, firebaseUser } = useAuth();
  
  useEffect(() => {
    // If firstName prop is provided, use it directly
    if (firstName) {
      setUserName(firstName);
      return;
    }
    
    // Check if we have user data from auth context
    if (currentUser?.first_name) {
      setUserName(currentUser.first_name);
      return;
    }
    
    // Fallback to Firebase user data
    if (firebaseUser) {
      const name = firebaseUser.displayName?.split(' ')[0] || 
                  firebaseUser.email?.split('@')[0] || 
                  'User';
      setUserName(name);
      return;
    }
    
    // Final fallback
    setUserName('User');
  }, [firstName, currentUser, firebaseUser]);
  
  if (!userName) {
    return <h1 className="text-2xl font-bold mb-6">Welcome to X-WATER!</h1>;
  }
  
  return (
    <h1 className="text-2xl font-bold mb-6">Hey {userName}, welcome back to X-WATER app!</h1>
  );
}
