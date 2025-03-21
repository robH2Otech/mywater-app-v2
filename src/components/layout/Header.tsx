
import { useEffect, useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { WelcomeMessage } from "./WelcomeMessage";
import { NotificationsMenu } from "./NotificationsMenu";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
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
          
          // First, check the private_users collection (for home users)
          const privateUsersRef = collection(db, "private_users");
          const privateQuery = query(privateUsersRef, where("uid", "==", user.uid));
          const privateSnapshot = await getDocs(privateQuery);
          
          if (!privateSnapshot.empty) {
            const userData = privateSnapshot.docs[0].data();
            console.log("Private user profile found:", userData);
            
            setFirstName(userData.first_name || "");
            setLastName(userData.last_name || "");
            return; // Exit early since we found the user
          }
          
          // Next, check the app_users_business collection
          const businessUsersRef = collection(db, "app_users_business");
          const businessQuery = query(businessUsersRef, where("email", "==", user.email));
          const businessSnapshot = await getDocs(businessQuery);
          
          if (!businessSnapshot.empty) {
            const userData = businessSnapshot.docs[0].data();
            console.log("Business user profile found:", userData);
            
            setFirstName(userData.first_name || "");
            setLastName(userData.last_name || "");
            return; // Exit early since we found the user
          }
          
          // Finally, check the original app_users collection and migrate if needed
          const usersRef = collection(db, "app_users");
          const usersQuery = query(usersRef, where("email", "==", user.email));
          const usersSnapshot = await getDocs(usersQuery);
          
          if (!usersSnapshot.empty) {
            const userData = usersSnapshot.docs[0].data();
            console.log("Legacy user profile found:", userData);
            
            // Migrate user to app_users_business
            try {
              await addDoc(collection(db, "app_users_business"), {
                ...userData,
                migrated_at: new Date().toISOString(),
              });
              console.log("User migrated to app_users_business successfully");
            } catch (migrateError) {
              console.error("Error migrating user:", migrateError);
            }
            
            setFirstName(userData.first_name || "");
            setLastName(userData.last_name || "");
            return;
          }
          
          // If we still don't have a name, extract from email as fallback
          if (!firstName && user.email) {
            const tempAccess = localStorage.getItem('tempAccess') === 'true';
            if (!tempAccess) {
              console.log("No user profile found, extracting from email");
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
  }, [firstName]);

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
