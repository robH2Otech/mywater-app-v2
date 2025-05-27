
import { useEffect, useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { WelcomeMessage } from "./WelcomeMessage";
import { NotificationsMenu } from "./NotificationsMenu";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/integrations/firebase/client";

interface HeaderProps {
  children?: React.ReactNode;
}

export const Header = ({ children }: HeaderProps) => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          console.log("Fetching user profile for UID:", user.uid);
          
          // First, check the app_users_business collection using the UID as document ID
          const businessUserDocRef = doc(db, "app_users_business", user.uid);
          const businessUserDoc = await getDoc(businessUserDocRef);
          
          if (businessUserDoc.exists()) {
            const userData = businessUserDoc.data();
            console.log("Business user profile found:", userData);
            
            setFirstName(userData.first_name || "");
            setLastName(userData.last_name || "");
            return; // Exit early since we found the user
          }
          
          // Fallback to private users collection
          const privateUserDocRef = doc(db, "app_users_privat", user.uid);
          const privateUserDoc = await getDoc(privateUserDocRef);
          
          if (privateUserDoc.exists()) {
            const userData = privateUserDoc.data();
            console.log("Private user profile found:", userData);
            
            setFirstName(userData.first_name || "");
            setLastName(userData.last_name || "");
            return;
          }
          
          // Final fallback - extract from email
          if (user.email) {
            console.log("No user profile found, extracting from email");
            const emailName = user.email.split('@')[0] || "";
            
            if (emailName) {
              const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
              setFirstName(formattedName);
            }
          }
        } catch (error) {
          console.error("Error in fetchUserProfile:", error);
        }
      } else {
        // Clear user data when logged out
        setFirstName("");
        setLastName("");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <header className="h-16 bg-spotify-darker border-b border-white/10 flex items-center justify-between px-6">
      <div className="flex items-center">
        {children}
        <WelcomeMessage firstName={firstName} />
      </div>
      <div className="flex items-center gap-4">
        <NotificationsMenu />
        <UserAvatar firstName={firstName} lastName={lastName} />
      </div>
    </header>
  );
};
