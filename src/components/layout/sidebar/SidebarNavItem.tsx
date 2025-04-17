
import { Link } from "react-router-dom";

interface NavigationItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

interface SidebarNavItemProps {
  item: NavigationItem;
  isActive: boolean;
  onClick?: () => void;
}

export function SidebarNavItem({ item, isActive, onClick }: SidebarNavItemProps) {
  return (
    <Link
      to={item.path}
      className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
        isActive
          ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
          : "text-gray-400 hover:text-white hover:bg-spotify-accent"
      }`}
      onClick={onClick}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      <span className="truncate">{item.name}</span>
    </Link>
  );
}
