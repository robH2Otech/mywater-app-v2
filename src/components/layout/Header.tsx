import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Header = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState<string>("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log("Fetching user profile for:", user.email);
          const { data: profiles, error } = await supabase
            .from('app_users')
            .select('first_name')
            .eq('email', user.email)
            .single();

          if (error) {
            console.error("Error fetching user profile:", error);
            return;
          }

          if (profiles) {
            console.log("User profile found:", profiles);
            setFirstName(profiles.first_name);
          }
        }
      } catch (error) {
        console.error("Error in fetchUserProfile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <header className="h-16 bg-spotify-darker border-b border-white/10 flex items-center justify-between px-6">
      {firstName && (
        <div className="text-white text-lg">
          Hey {firstName}, welcome back!
        </div>
      )}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarFallback className="bg-spotify-green text-white">
                {firstName ? firstName.charAt(0).toUpperCase() : "U"}
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
      </div>
    </header>
  );
};