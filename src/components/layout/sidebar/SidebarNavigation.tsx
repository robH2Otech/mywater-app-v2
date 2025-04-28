
import { LogOut } from "lucide-react";
import { Link, Location } from "react-router-dom";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarLogoutButton } from "./SidebarLogoutButton";
import { Tooltip } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

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
  collapsed?: boolean;
}

export function SidebarNavigation({ 
  navigation, 
  location, 
  isMobile, 
  closeSidebar,
  handleLogout,
  collapsed = false
}: SidebarNavigationProps) {
  return (
    <nav className="space-y-1 flex-grow overflow-y-auto px-2">
      {collapsed ? (
        // Collapsed sidebar view with just icons
        <div className="flex flex-col items-center space-y-4 pt-2">
          {navigation.map((item) => {
            const isActive = 
              location.pathname === item.path || 
              (item.path === "/private-dashboard" && location.pathname === "/private-dashboard/") ||
              (item.path !== "/private-dashboard" && location.pathname.startsWith(item.path));
            
            return (
              <Tooltip
                key={item.name}
                content={item.name}
                side="right"
              >
                <Link
                  to={item.path}
                  className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-mywater-accent to-blue-600 text-white shadow-md"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                </Link>
              </Tooltip>
            );
          })}
          
          <Tooltip content="Log out" side="right">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-12 h-12 mt-6 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </Tooltip>
        </div>
      ) : (
        // Expanded sidebar view
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-1"
        >
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
        </motion.div>
      )}
    </nav>
  );
}
