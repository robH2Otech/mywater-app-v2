
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
          console.log("Header: Fetching user profile for UID:", user.uid);
          
          // Get user claims first to check role
          const idTokenResult = await user.getIdTokenResult();
          const userRole = idTokenResult.claims.role as string;
          
          console.log("Header: User role from claims:", userRole);
          
          // Initialize with proper fallback from email
          let extractedFirstName = "";
          let extractedLastName = "";
          
          if (user.email) {
            // Extract name from email for better fallback
            const emailPart = user.email.split('@')[0];
            if (emailPart.includes('.')) {
              const nameParts = emailPart.split('.');
              extractedFirstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
              extractedLastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : "";
            } else {
              extractedFirstName = emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
              extractedLastName = "";
            }
          }
          
          // Try to get profile from Firestore first
          let profileFound = false;
          
          // Check business users collection
          try {
            const businessUserDocRef = doc(db, "app_users_business", user.uid);
            const businessUserDoc = await getDoc(businessUserDocRef);
            
            if (businessUserDoc.exists()) {
              const userData = businessUserDoc.data();
              console.log("Header: Business user profile found:", userData);
              
              setFirstName(userData.first_name || extractedFirstName || "User");
              setLastName(userData.last_name || extractedLastName || "");
              profileFound = true;
            }
          } catch (error) {
            console.log("Header: Error fetching business user profile:", error);
          }
          
          // If no business profile found, try private users collection
          if (!profileFound) {
            try {
              const privateUserDocRef = doc(db, "app_users_privat", user.uid);
              const privateUserDoc = await getDoc(privateUserDocRef);
              
              if (privateUserDoc.exists()) {
                const userData = privateUserDoc.data();
                console.log("Header: Private user profile found:", userData);
                
                setFirstName(userData.first_name || extractedFirstName || "User");
                setLastName(userData.last_name || extractedLastName || "");
                profileFound = true;
              }
            } catch (error) {
              console.log("Header: Error fetching private user profile:", error);
            }
          }
          
          // If no profile found, use extracted names from email or Firebase Auth data
          if (!profileFound) {
            console.log("Header: No Firestore profile found, using extracted data");
            
            if (user.displayName) {
              const nameParts = user.displayName.split(' ');
              setFirstName(nameParts[0] || extractedFirstName || "User");
              setLastName(nameParts.length > 1 ? nameParts.slice(1).join(' ') : extractedLastName);
            } else {
              // Use extracted names from email
              setFirstName(extractedFirstName || "User");
              setLastName(extractedLastName || "");
            }
          }
          
        } catch (error) {
          console.error("Header: Error in fetchUserProfile:", error);
          
          // Final fallback - use email or default
          if (user.email) {
            const emailPart = user.email.split('@')[0];
            if (emailPart.includes('.')) {
              const nameParts = emailPart.split('.');
              setFirstName(nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1));
              setLastName(nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : "");
            } else {
              setFirstName(emailPart.charAt(0).toUpperCase() + emailPart.slice(1));
              setLastName("");
            }
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
