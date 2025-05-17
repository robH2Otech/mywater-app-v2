
import { Home, Droplets, Filter, Bell, BarChart2, Users, Settings, Lightbulb, X, MessageSquare, MapPin, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { SidebarLogoutButton } from "./sidebar/SidebarLogoutButton";
import { auth } from "@/integrations/firebase/client";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  isMobile?: boolean;
  closeSidebar?: () => void;
}

export const Sidebar = ({ isMobile, closeSidebar }: SidebarProps) => {
  const location = useLocation();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navigation = [
    { name: t("nav.dashboard"), icon: Home, path: "/dashboard" },
    { name: t("nav.water.units"), icon: Droplets, path: "/units" },
    { name: "Units Location", icon: MapPin, path: "/locations" },
    { name: t("nav.filters"), icon: Filter, path: "/filters" },
    { name: t("nav.uvc"), icon: Lightbulb, path: "/uvc" },
    { name: t("nav.alerts"), icon: Bell, path: "/alerts" },
    { name: t("nav.analytics"), icon: BarChart2, path: "/analytics" },
    { name: t("nav.users"), icon: Users, path: "/users" },
    { name: t("nav.client.requests"), icon: MessageSquare, path: "/client-requests" },
    { name: t("nav.settings"), icon: Settings, path: "/settings" },
  ];

  return (
    <div className={`h-screen ${isMobile ? "w-[250px]" : "w-64"} bg-spotify-darker border-r border-white/10 flex flex-col`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Droplets className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white leading-tight">X-WATER</h1>
          </div>
        </div>
        
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={closeSidebar}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        )}
      </div>
      
      <nav className="space-y-1 flex-grow overflow-y-auto p-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path === "/units" && location.pathname.startsWith("/units")) ||
                          (item.path === "/locations" && location.pathname.startsWith("/locations"));
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:text-white hover:bg-spotify-accent"
              }`}
              onClick={isMobile ? closeSidebar : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
        
        {/* Add Logout Button */}
        <SidebarLogoutButton handleLogout={handleLogout} />
      </nav>
    </div>
  );
};
