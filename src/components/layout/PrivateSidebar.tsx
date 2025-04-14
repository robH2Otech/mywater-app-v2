
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
  BarChart2
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
  
  console.log("Current location path in PrivateSidebar:", location.pathname);

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
    { name: "Impact", icon: BarChart2, path: "/private-dashboard/impact" },
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
          // Improved active state detection logic
          const isExactMatch = location.pathname === item.path;
          const isChildRoute = location.pathname.startsWith(item.path) && item.path !== "/private-dashboard";
          const isActive = isExactMatch || (isChildRoute && item.path !== "/private-dashboard");
          
          // Special case for home to avoid conflicts with child routes
          if (item.path === "/private-dashboard" && location.pathname !== "/private-dashboard") {
            // Don't mark home as active when on child routes
            console.log("Home not active because we're on a child route:", location.pathname);
          }
          
          console.log(`Navigation item: ${item.name}, path: ${item.path}, isActive: ${isActive}, location: ${location.pathname}`);
          
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={(e) => {
                console.log(`Clicked on ${item.name}, navigating to ${item.path}`);
                if (isMobile && closeSidebar) {
                  closeSidebar();
                }
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:text-white hover:bg-spotify-accent"
              }`}
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
