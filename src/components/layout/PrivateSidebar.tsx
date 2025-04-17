
import { 
  Home, 
  UserCircle, 
  Share2,
  Wrench, 
  HelpCircle, 
  ShoppingCart, 
  Settings, 
  LogOut,
  X,
  Calculator
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { auth } from "@/integrations/firebase/client";
import { useNavigate } from "react-router-dom";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";

interface PrivateSidebarProps {
  isMobile?: boolean;
  closeSidebar?: () => void;
}

export const PrivateSidebar = ({ isMobile, closeSidebar }: PrivateSidebarProps) => {
  const location = useLocation();
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
    { name: "Home", icon: Home, path: "/private-dashboard" },
    { name: "My Profile", icon: UserCircle, path: "/private-dashboard/profile" },
    { name: "Refer a Friend", icon: Share2, path: "/private-dashboard/refer" },
    { name: "Impact Calculator", icon: Calculator, path: "/private-dashboard/data" },
    { name: "Installation Guide", icon: Wrench, path: "/private-dashboard/install" },
    { name: "Support", icon: HelpCircle, path: "/private-dashboard/support" },
    { name: "Shop", icon: ShoppingCart, path: "/private-dashboard/shop" },
    { name: "Settings", icon: Settings, path: "/private-dashboard/settings" },
  ];

  return (
    <div className={`h-screen ${isMobile ? "w-[250px]" : "w-64"} bg-spotify-darker border-r border-white/10 flex flex-col`}>
      <SidebarHeader 
        isMobile={isMobile} 
        closeSidebar={closeSidebar} 
      />
      
      <SidebarNavigation 
        navigation={navigation}
        location={location}
        isMobile={isMobile}
        closeSidebar={closeSidebar}
        handleLogout={handleLogout}
      />
    </div>
  );
}
