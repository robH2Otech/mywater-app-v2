
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { WelcomeMessage } from "./WelcomeMessage";

export const Header = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log("Fetching user profile for id:", user.id);
          const { data: profile, error } = await supabase
            .from('app_users')
            .select('first_name, last_name')
            .eq('id', user.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching user profile:", error);
            return;
          }

          if (profile) {
            console.log("User profile found:", profile);
            setFirstName(profile.first_name || "");
            setLastName(profile.last_name || "");
          } else {
            console.log("No user profile found");
          }
        }
      } catch (error) {
        console.error("Error in fetchUserProfile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <header className="h-16 bg-spotify-darker border-b border-white/10 flex items-center justify-between px-6">
      {firstName && <WelcomeMessage firstName={firstName} />}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Bell className="h-5 w-5" />
        </Button>
        <UserAvatar firstName={firstName} lastName={lastName} />
      </div>
    </header>
  );
};
