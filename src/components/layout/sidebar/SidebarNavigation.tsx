import { LogOut } from "lucide-react";
import { Link, Location } from "react-router-dom";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarLogoutButton } from "./SidebarLogoutButton";
import { Tooltip } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";

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
  const { t } = useLanguage();
  const { userType, userRole } = useFirebaseAuth();
  
  const businessItems = [
    { name: t("sidebar.dashboard"), path: "/dashboard", icon: Home },
    { name: t("sidebar.units"), path: "/units", icon: LayoutGrid },
    { name: t("sidebar.locations"), path: "/locations", icon: MapPin },
    { name: t("sidebar.uvc"), path: "/uvc", icon: Lightbulb },
    { name: t("sidebar.analytics"), path: "/analytics", icon: BarChart },
    { name: t("sidebar.ml_analytics"), path: "/ml-dashboard", icon: Activity },
    { name: t("sidebar.alerts"), path: "/alerts", icon: Bell },
    { name: t("sidebar.filters"), path: "/filters", icon: Filter },
    { name: t("sidebar.requests"), path: "/requests", icon: MessageSquare },
    { name: t("sidebar.users"), path: "/users", icon: Users },
    { name: t("sidebar.settings"), path: "/settings", icon: Settings }
  ];
  
  return (
    <nav className="space-y-1 flex-grow overflow-y-auto px-2">
      {collapsed ? (
        // Collapsed sidebar view with just icons
        <div className="flex flex-col items-center space-y-4 pt-2">
          {navigation.map((item) => {
            const isActive = 
              location.pathname === item.path || 
              (location.pathname.includes(item.path) && item.path !== "/private-dashboard") ||
              (item.path === "/private-dashboard" && location.pathname === "/private-dashboard/");
            
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
          
          <Tooltip content="Log Out" side="right">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-12 h-12 mt-4 rounded-lg text-red-500 hover:text-white hover:bg-red-600/20 transition-all duration-200 bg-white/5"
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
              (location.pathname.includes(item.path) && item.path !== "/private-dashboard") ||
              (item.path === "/private-dashboard" && location.pathname === "/private-dashboard/");
            
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
