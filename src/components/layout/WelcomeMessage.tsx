import { useEffect, useState } from "react";
import { auth } from "@/integrations/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

interface WelcomeMessageProps {
  firstName?: string;
}

export function WelcomeMessage({ firstName }: WelcomeMessageProps) {
  const [userName, setUserName] = useState<string>("");
  
  useEffect(() => {
    // If firstName prop is provided, use it directly
    if (firstName) {
      setUserName(firstName);
      sessionStorage.setItem('userDisplayName', firstName);
      return;
    }
    
    // Check if we already have the name in session storage
    const storedName = sessionStorage.getItem('userDisplayName');
    
    if (storedName) {
      setUserName(storedName);
      return;
    }
    
    // Otherwise, fetch the user's name from Firestore
    const fetchUserName = async () => {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        return;
      }
      
      try {
        // First check business users collection using UID as document ID
        const businessUserDocRef = doc(db, "app_users_business", currentUser.uid);
        const businessUserDoc = await getDoc(businessUserDocRef);
        
        if (businessUserDoc.exists()) {
          const userData = businessUserDoc.data();
          // Only use the first name
          const name = userData.first_name || "";
          setUserName(name);
          sessionStorage.setItem('userDisplayName', name);
          return;
        }
        
        // Fallback to private users collection
        const privateUserDocRef = doc(db, "app_users_privat", currentUser.uid);
        const privateUserDoc = await getDoc(privateUserDocRef);
        
        if (privateUserDoc.exists()) {
          const userData = privateUserDoc.data();
          // Only use the first name
          const name = userData.first_name || "";
          setUserName(name);
          sessionStorage.setItem('userDisplayName', name);
          return;
        }
        
        // As a last resort, use the displayName from auth but only take the first name
        if (currentUser.displayName) {
          const firstNameOnly = currentUser.displayName.split(' ')[0];
          setUserName(firstNameOnly);
          sessionStorage.setItem('userDisplayName', firstNameOnly);
          return;
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };
    
    fetchUserName();
  }, [firstName]);
  
  if (!userName) {
    return <h1 className="text-2xl font-bold mb-6">Welcome to X-WATER!</h1>;
  }
  
  return (
    <h1 className="text-2xl font-bold mb-6">Hey {userName}, welcome back to X-WATER app!</h1>
  );
}
