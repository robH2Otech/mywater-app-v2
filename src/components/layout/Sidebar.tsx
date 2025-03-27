
import { Home, Droplets, Filter, Bell, BarChart2, Users, Settings, Lightbulb, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface SidebarProps {
  isMobile?: boolean;
  closeSidebar?: () => void;
}

export const Sidebar = ({ isMobile, closeSidebar }: SidebarProps) => {
  const location = useLocation();
  const { t } = useLanguage();

  const navigation = [
    { name: t("nav.dashboard"), icon: Home, path: "/dashboard" },
    { name: t("nav.water.units"), icon: Droplets, path: "/units" },
    { name: t("nav.filters"), icon: Filter, path: "/filters" },
    { name: t("nav.uvc"), icon: Lightbulb, path: "/uvc" },
    { name: t("nav.alerts"), icon: Bell, path: "/alerts" },
    { name: t("nav.analytics"), icon: BarChart2, path: "/analytics" },
    { name: t("nav.users"), icon: Users, path: "/users" },
    { name: t("nav.settings"), icon: Settings, path: "/settings" },
  ];

  return (
    <div className={`h-screen ${isMobile ? "w-[250px]" : "w-64"} bg-spotify-darker border-r border-white/10 flex flex-col`}>
      {/* Sidebar header with close button for mobile */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Droplets className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white leading-tight">MYWATER</h1>
            <span className="text-sm text-white/80">Technologies</span>
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
      
      {/* Navigation links */}
      <nav className="space-y-1 flex-grow overflow-y-auto p-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path;
          
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
      </nav>
    </div>
  );
};
