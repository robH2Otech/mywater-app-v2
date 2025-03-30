
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { auth } from "@/integrations/firebase/client";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
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

export function UserAvatar({ firstName, lastName, className = "h-9 w-9", showMenu = true }: UserAvatarProps) {
  const [initials, setInitials] = useState<string>("U");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // If firstName and lastName are provided via props, use them directly
    if (firstName && lastName) {
      const userInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
      setInitials(userInitials.toUpperCase());
      return;
    }
    
    // Check if we have cached initials
    const cachedInitials = sessionStorage.getItem('userInitials');
    if (cachedInitials) {
      setInitials(cachedInitials);
      return;
    }
    
    const fetchUserInitials = async () => {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        return;
      }
      
      try {
        // First check private users collection
        const privateUsersRef = collection(db, "app_users_private");
        const q = query(privateUsersRef, where("id", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          const firstName = userData.first_name || userData.firstName || "";
          const lastName = userData.last_name || userData.lastName || "";
          
          if (firstName && lastName) {
            const userInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
            setInitials(userInitials.toUpperCase());
            sessionStorage.setItem('userInitials', userInitials.toUpperCase());
            return;
          }
        }
        
        // If not found, check business users
        const businessUsersRef = collection(db, "app_users_business");
        const businessQuery = query(businessUsersRef, where("id", "==", currentUser.uid));
        const businessSnapshot = await getDocs(businessQuery);
        
        if (!businessSnapshot.empty) {
          const userData = businessSnapshot.docs[0].data();
          const firstName = userData.first_name || userData.firstName || "";
          const lastName = userData.last_name || userData.lastName || "";
          
          if (firstName && lastName) {
            const userInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
            setInitials(userInitials.toUpperCase());
            sessionStorage.setItem('userInitials', userInitials.toUpperCase());
            return;
          }
        }
        
        // As a last resort, use displayName from auth
        if (currentUser.displayName) {
          const nameParts = currentUser.displayName.split(' ');
          if (nameParts.length >= 2) {
            const userInitials = `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`;
            setInitials(userInitials.toUpperCase());
            sessionStorage.setItem('userInitials', userInitials.toUpperCase());
          } else if (nameParts.length === 1) {
            setInitials(nameParts[0].charAt(0).toUpperCase());
            sessionStorage.setItem('userInitials', nameParts[0].charAt(0).toUpperCase());
          }
        }
      } catch (error) {
        console.error("Error fetching user data for avatar:", error);
      }
    };
    
    fetchUserInitials();
  }, [firstName, lastName]);
  
  const handleSignOut = async () => {
    try {
      await logoutUser();
      
      // Clear session storage
      sessionStorage.removeItem('userDisplayName');
      sessionStorage.removeItem('userInitials');
      
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account",
      });
      
      // Navigate to home page
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
