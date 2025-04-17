
import { LogOut } from "lucide-react";

interface SidebarLogoutButtonProps {
  handleLogout: () => Promise<void>;
}

export function SidebarLogoutButton({ handleLogout }: SidebarLogoutButtonProps) {
  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-gray-400 hover:text-white hover:bg-spotify-accent"
    >
      <LogOut className="h-5 w-5 flex-shrink-0" />
      <span className="truncate">Log Out</span>
    </button>
  );
}
