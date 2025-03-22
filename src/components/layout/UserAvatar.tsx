
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logoutUser } from "@/utils/firebase/auth";

interface UserAvatarProps {
  firstName: string;
  lastName: string;
}

export const UserAvatar = ({ firstName, lastName }: UserAvatarProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully");
      navigate("/"); // Navigate to landing page instead of /auth
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const getInitials = () => {
    // Trim and check for non-empty strings to avoid initials like "U"
    const firstInitial = firstName && firstName.trim() ? firstName.trim().charAt(0).toUpperCase() : "";
    const lastInitial = lastName && lastName.trim() ? lastName.trim().charAt(0).toUpperCase() : "";
    
    // If both initials are available, use them
    if (firstInitial && lastInitial) {
      return `${firstInitial}${lastInitial}`;
    }
    
    // If only first name is available, use first 2 letters
    if (firstInitial && !lastInitial && firstName.length > 1) {
      return `${firstName.substring(0, 2).toUpperCase()}`;
    }
    
    // Default fallback
    return firstInitial || lastInitial || "U";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarFallback className="bg-mywater-blue text-white">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-spotify-darker border-spotify-accent">
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-white hover:bg-spotify-accent cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
