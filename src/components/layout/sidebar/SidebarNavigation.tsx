
import { LogOut } from "lucide-react";
import { Link, Location } from "react-router-dom";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarLogoutButton } from "./SidebarLogoutButton";

interface NavigationItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

interface SidebarNavigationProps {
  navigation: NavigationItem[];
  location: Location;
  isMobile?: boolean;
  closeSidebar?: () => void;
  handleLogout: () => Promise<void>;
}

export function SidebarNavigation({ 
  navigation, 
  location, 
  isMobile, 
  closeSidebar,
  handleLogout 
}: SidebarNavigationProps) {
  return (
    <nav className="space-y-1 flex-grow overflow-y-auto p-2">
      {navigation.map((item) => {
        const isActive = 
          location.pathname === item.path || 
          (item.path === "/private-dashboard" && location.pathname === "/private-dashboard/") ||
          (item.path !== "/private-dashboard" && location.pathname.startsWith(item.path));
        
        return (
          <SidebarNavItem 
            key={item.name}
            item={item}
            isActive={isActive}
            onClick={isMobile ? closeSidebar : undefined}
          />
        );
      })}
      
      <SidebarLogoutButton handleLogout={handleLogout} />
    </nav>
  );
}
