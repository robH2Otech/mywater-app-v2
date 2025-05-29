
import { useEffect, useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { WelcomeMessage } from "./WelcomeMessage";
import { NotificationsMenu } from "./NotificationsMenu";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  children?: React.ReactNode;
}

export const Header = ({ children }: HeaderProps) => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const { currentUser, firebaseUser } = useAuth();

  useEffect(() => {
    // Get user data from auth context first
    if (currentUser) {
      setFirstName(currentUser.first_name || "");
      setLastName(currentUser.last_name || "");
      return;
    }
    
    // Fallback to Firebase user data
    if (firebaseUser) {
      const displayName = firebaseUser.displayName;
      const email = firebaseUser.email;
      
      if (displayName) {
        const nameParts = displayName.split(' ');
        setFirstName(nameParts[0] || "");
        setLastName(nameParts[1] || "");
      } else if (email) {
        // Extract name from email
        const emailName = email.split('@')[0];
        const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        setFirstName(formattedName);
        setLastName("");
      }
    }
  }, [currentUser, firebaseUser]);

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
