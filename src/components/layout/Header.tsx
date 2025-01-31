import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Header = () => {
  return (
    <header className="h-16 bg-spotify-darker border-b border-white/10 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">Hey Rob, welcome back!</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Bell className="h-5 w-5" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-spotify-green text-white">RS</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};