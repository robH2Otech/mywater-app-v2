
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
import { auth } from "@/integrations/firebase/client";

interface UserAvatarProps {
  firstName: string;
  lastName: string;
}

export const UserAvatar = ({ firstName, lastName }: UserAvatarProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const getInitials = () => {
    if (firstName && lastName) {
      // Ensure we get the first character of each name, properly capitalized
      const firstInitial = firstName.charAt(0).toUpperCase();
      const lastInitial = lastName.charAt(0).toUpperCase();
      return `${firstInitial}${lastInitial}`;
    } else if (firstName) {
      // If only first name is available
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      // If only last name is available
      return lastName.charAt(0).toUpperCase();
    }
    return "U"; // Default fallback
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarFallback className="bg-mywater-blue text-white font-medium">
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
