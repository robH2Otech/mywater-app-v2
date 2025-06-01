
import { useEffect, useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { WelcomeMessage } from "./WelcomeMessage";
import { NotificationsMenu } from "./NotificationsMenu";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/integrations/firebase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  children?: React.ReactNode;
}

export const Header = ({ children }: HeaderProps) => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const isMobile = useIsMobile();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          console.log("Fetching user profile for UID:", user.uid);
          
          // Get user claims first to check if superadmin
          const idTokenResult = await user.getIdTokenResult();
          const userRole = idTokenResult.claims.role as string;
          
          console.log("User role from claims:", userRole);
          
          // Try to get profile from Firestore
          let profileFound = false;
          
          // First, check the app_users_business collection using the UID as document ID
          try {
            const businessUserDocRef = doc(db, "app_users_business", user.uid);
            const businessUserDoc = await getDoc(businessUserDocRef);
            
            if (businessUserDoc.exists()) {
              const userData = businessUserDoc.data();
              console.log("Business user profile found:", userData);
              
              setFirstName(userData.first_name || "");
              setLastName(userData.last_name || "");
              profileFound = true;
            }
          } catch (error) {
            console.log("Error fetching business user profile:", error);
          }
          
          // If no business profile found, try private users collection
          if (!profileFound) {
            try {
              const privateUserDocRef = doc(db, "app_users_privat", user.uid);
              const privateUserDoc = await getDoc(privateUserDocRef);
              
              if (privateUserDoc.exists()) {
                const userData = privateUserDoc.data();
                console.log("Private user profile found:", userData);
                
                setFirstName(userData.first_name || "");
                setLastName(userData.last_name || "");
                profileFound = true;
              }
            } catch (error) {
              console.log("Error fetching private user profile:", error);
            }
          }
          
          // If no profile found, use Firebase Auth data or email as fallback
          if (!profileFound) {
            console.log("No Firestore profile found, using Firebase Auth data");
            
            if (user.displayName) {
              const nameParts = user.displayName.split(' ');
              setFirstName(nameParts[0] || "");
              setLastName(nameParts.length > 1 ? nameParts.slice(1).join(' ') : "");
            } else if (user.email) {
              // Extract name from email for superadmin accounts
              const emailName = user.email.split('@')[0] || "";
              
              if (userRole === 'superadmin') {
                setFirstName("Super");
                setLastName("Admin");
              } else if (emailName) {
                const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
                setFirstName(formattedName);
                setLastName("");
              }
            }
          }
          
        } catch (error) {
          console.error("Error in fetchUserProfile:", error);
          
          // Final fallback - use email or default
          if (user.email) {
            const emailName = user.email.split('@')[0] || "";
            const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
            setFirstName(formattedName);
            setLastName("");
          } else {
            setFirstName("User");
            setLastName("");
          }
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
    <header className={`${isMobile ? 'h-14' : 'h-16'} bg-spotify-darker/95 border-b border-white/10 flex items-center justify-between ${isMobile ? 'px-4' : 'px-6'} backdrop-blur-md`}>
      <div className="flex items-center flex-1 min-w-0">
        {children}
        <div className="min-w-0 flex-1">
          <WelcomeMessage firstName={firstName} isMobile={isMobile} />
        </div>
      </div>
      <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
        <NotificationsMenu isMobile={isMobile} />
        <UserAvatar firstName={firstName} lastName={lastName} isMobile={isMobile} />
      </div>
    </header>
  );
};
