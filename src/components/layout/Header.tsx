import { useEffect, useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { WelcomeMessage } from "./WelcomeMessage";
import { NotificationsMenu } from "./NotificationsMenu";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/integrations/firebase/client";

export const Header = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          console.log("Fetching user profile for email:", user.email);
          
          // Query the app_users collection to find the user by email
          const usersRef = collection(db, "app_users");
          const q = query(usersRef, where("email", "==", user.email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            console.log("User profile found:", userData);
            
            setFirstName(userData.first_name || "");
            setLastName(userData.last_name || "");
          } else {
            // Check if we have a temp access user or need to create a profile
            const tempAccess = localStorage.getItem('tempAccess') === 'true';
            if (!tempAccess) {
              console.log("No user profile found, extracting from email");
              // Extract name from email as fallback (e.g., robert@example.com -> Robert)
              const emailName = user.email?.split('@')[0] || "";
              if (emailName) {
                const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
                setFirstName(formattedName);
              }
            }
          }
        } catch (error) {
          console.error("Error in fetchUserProfile:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <header className="h-16 bg-spotify-darker border-b border-white/10 flex items-center justify-between px-6">
      <WelcomeMessage firstName={firstName} />
      <div className="flex items-center gap-4">
        <NotificationsMenu />
        <UserAvatar firstName={firstName} lastName={lastName} />
      </div>
    </header>
  );
};
