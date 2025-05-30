
import { UserAvatar } from "./UserAvatar";
import { WelcomeMessage } from "./WelcomeMessage";
import { NotificationsMenu } from "./NotificationsMenu";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  children?: React.ReactNode;
}

export const Header = ({ children }: HeaderProps) => {
  const { getUserFirstName, getUserInitials } = useAuth();

  return (
    <header className="h-16 bg-spotify-darker border-b border-white/10 flex items-center justify-between px-6">
      <div className="flex items-center">
        {children}
        <WelcomeMessage firstName={getUserFirstName()} />
      </div>
      <div className="flex items-center gap-4">
        <NotificationsMenu />
        <UserAvatar />
      </div>
    </header>
  );
};
