
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserAvatarProps {
  firstName: string;
  lastName: string;
  isMobile?: boolean;
}

export const UserAvatar = ({ firstName, lastName, isMobile: propIsMobile }: UserAvatarProps) => {
  const hookIsMobile = useIsMobile();
  const isMobile = propIsMobile !== undefined ? propIsMobile : hookIsMobile;

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";

  return (
    <Avatar className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} border-2 border-white/20`}>
      <AvatarFallback className={`bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
