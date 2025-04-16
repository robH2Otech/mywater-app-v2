
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
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <img src="/lovable-uploads/f2f80940-5fa8-45b6-a3dd-78b6282cf10e.png" alt="Water Filter" className="h-8 w-8 object-contain" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white leading-tight">MYWATER</h1>
            <span className="text-sm text-white/80">Home User</span>
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
          const isActive = 
            location.pathname === item.path || 
            (item.path === "/private-dashboard" && location.pathname === "/private-dashboard/") ||
            (item.path !== "/private-dashboard" && location.pathname.startsWith(item.path));
          
          console.log(`Menu item: ${item.name}, path: ${item.path}, isActive: ${isActive}, current path: ${location.pathname}`);
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-spotify-accent"
              }`}
              onClick={isMobile ? closeSidebar : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-gray-400 hover:text-white hover:bg-spotify-accent"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="truncate">Log Out</span>
        </button>
      </nav>
    </div>
  );
}
