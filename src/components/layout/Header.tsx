
import { useEffect, useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { WelcomeMessage } from "./WelcomeMessage";
import { NotificationsMenu } from "./NotificationsMenu";
import { collection, query, where, getDocs } from "firebase/firestore";
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
          console.log("Fetching user profile for email:", user.email);
          
          // First check if the user has a profile in the private_users collection
          const privateUsersRef = collection(db, "private_users");
          const privateQuery = query(privateUsersRef, where("uid", "==", user.uid));
          const privateSnapshot = await getDocs(privateQuery);
          
          if (!privateSnapshot.empty) {
            const userData = privateSnapshot.docs[0].data();
            console.log("Private user profile found:", userData);
            
            setFirstName(userData.first_name || "");
            setLastName(userData.last_name || "");
            return;
          }
          
          // If not found in private users, check business users
          const businessUsersRef = collection(db, "app_users_business");
          const businessQuery = query(businessUsersRef, where("id", "==", user.uid));
          const businessSnapshot = await getDocs(businessQuery);
          
          if (!businessSnapshot.empty) {
            const userData = businessSnapshot.docs[0].data();
            console.log("Business user profile found:", userData);
            
            setFirstName(userData.first_name || "");
            setLastName(userData.last_name || "");
            return;
          }
          
          // Fallback to app_users collection
          const usersRef = collection(db, "app_users");
          const usersQuery = query(usersRef, where("email", "==", user.email));
          const querySnapshot = await getDocs(usersQuery);
          
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
