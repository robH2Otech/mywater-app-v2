
import { LogOut } from "lucide-react";

interface SidebarLogoutButtonProps {
  handleLogout: () => Promise<void>;
}

export function SidebarLogoutButton({ handleLogout }: SidebarLogoutButtonProps) {
  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-md transition-colors text-gray-400 hover:text-white hover:bg-red-600/20 border border-transparent hover:border-red-600/30 bg-white/5"
    >
      <LogOut className="h-5 w-5 flex-shrink-0 text-red-500" />
      <span className="truncate font-medium">Log Out</span>
    </button>
  );
}
