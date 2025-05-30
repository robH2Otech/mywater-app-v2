
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "@/utils/firebase/auth";
import { useToast } from "@/hooks/use-toast";

interface UserAvatarProps {
  firstName?: string;
  lastName?: string;
  className?: string;
  showMenu?: boolean;
}

export function UserAvatar({ className = "h-9 w-9", showMenu = true }: UserAvatarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getUserInitials } = useAuth();
  
  // Get initials from auth context
  const initials = getUserInitials();
  
  const handleSignOut = async () => {
    try {
      await logoutUser();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account",
      });
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  if (!showMenu) {
    return (
      <Avatar className={className}>
        <AvatarFallback className="bg-mywater-blue">{initials}</AvatarFallback>
      </Avatar>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none">
          <Avatar className={className}>
            <AvatarFallback className="bg-mywater-blue">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/private-dashboard")}>
          <User className="mr-2 h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer text-red-500" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
