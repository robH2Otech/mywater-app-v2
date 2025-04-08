
import { useEffect, useState } from "react";
import { auth } from "@/integrations/firebase/client";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

interface WelcomeMessageProps {
  firstName?: string;
  // We're not adding lastName here since we only need firstName for the message
}

export function WelcomeMessage({ firstName }: WelcomeMessageProps) {
  const [userName, setUserName] = useState<string>("");
  
  useEffect(() => {
    // Check if we already have the name in session storage
    const storedName = sessionStorage.getItem('userDisplayName');
    
    if (storedName) {
      setUserName(storedName);
      return;
    }
    
    // If firstName prop is provided, use it
    if (firstName) {
      setUserName(firstName);
      return;
    }
    
    // Otherwise, fetch the user's name from Firestore
    const fetchUserName = async () => {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        return;
      }
      
      try {
        // Try to get user from private users collection
        const privateUsersRef = collection(db, "app_users_private");
        const q = query(privateUsersRef, where("id", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          const name = userData.first_name || userData.firstName || "";
          setUserName(name);
          sessionStorage.setItem('userDisplayName', name);
          return;
        }
        
        // If not found in private users, check business users
        const businessUsersRef = collection(db, "app_users_business");
        const businessQuery = query(businessUsersRef, where("id", "==", currentUser.uid));
        const businessSnapshot = await getDocs(businessQuery);
        
        if (!businessSnapshot.empty) {
          const userData = businessSnapshot.docs[0].data();
          const name = userData.first_name || userData.firstName || "";
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
    return <h1 className="text-2xl font-bold mb-6">Welcome to MYWATER!</h1>;
  }
  
  return (
    <h1 className="text-2xl font-bold mb-6">Hey {userName}, welcome back to MYWATER app!</h1>
  );
}
