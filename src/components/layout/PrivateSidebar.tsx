
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
  Calculator,
  ChevronLeft
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { auth } from "@/integrations/firebase/client";
import { useNavigate } from "react-router-dom";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface PrivateSidebarProps {
  isMobile?: boolean;
  closeSidebar?: () => void;
  collapsed?: boolean;
  toggleSidebar?: () => void;
}

export const PrivateSidebar = ({ 
  isMobile, 
  closeSidebar, 
  collapsed = false,
  toggleSidebar 
}: PrivateSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string>("User");
  
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserEmail(currentUser.email);
      // Set display name to first part of email or use "User" if no email available
      setUserDisplayName(currentUser.email ? currentUser.email.split('@')[0] : "User");
    }
  }, []);
  
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
    <div className="h-screen bg-spotify-darker/90 border-r border-white/10 flex flex-col backdrop-blur-md">
      <SidebarHeader 
        isMobile={isMobile} 
        closeSidebar={closeSidebar}
        collapsed={collapsed}
      />

      <div className="py-4 flex flex-col flex-grow overflow-hidden">
        {!collapsed && !isMobile && (
          <div className="px-4 mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-8 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-mywater-accent"
              />
              <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}
        
        <SidebarNavigation 
          navigation={navigation}
          location={location}
          isMobile={isMobile}
          closeSidebar={closeSidebar}
          handleLogout={handleLogout}
          collapsed={collapsed}
        />
      </div>

      {/* User profile section at bottom */}
      <div className="mt-auto p-2 border-t border-white/10">
        <div className={`flex items-center ${collapsed ? 'justify-center p-2' : 'px-4 py-3'}`}>
          {!collapsed ? (
            <>
              <div className="flex-shrink-0 mr-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-mywater-accent to-blue-600 flex items-center justify-center text-white font-medium">
                  {userDisplayName ? userDisplayName.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userDisplayName || "User"}</p>
                <p className="text-xs text-gray-400 truncate">{userEmail || "No email available"}</p>
              </div>
            </>
          ) : (
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-mywater-accent to-blue-600 flex items-center justify-center text-white font-medium">
              {userDisplayName ? userDisplayName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
