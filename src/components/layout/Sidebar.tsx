
import { LayoutDashboard, Droplet, MapPin, Filter, Zap, Bell, BarChart2, Users, MessageSquare, Settings, Activity, X } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { auth } from "@/integrations/firebase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { motion } from "framer-motion";

interface SidebarProps {
  isMobile?: boolean;
  closeSidebar?: () => void;
  isOpen?: boolean;
}

export function Sidebar({ isMobile, closeSidebar, isOpen }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    userRole, 
    canViewNavItem
  } = usePermissions();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Define menu items with role-based visibility
  const menuItems = [
    { 
      to: "/dashboard", 
      icon: <LayoutDashboard size={isMobile ? 20 : 16} />,
      text: "Dashboard",
      visible: canViewNavItem('dashboard')
    },
    { 
      to: "/units", 
      icon: <Droplet size={isMobile ? 20 : 16} />,
      text: "Water Units",
      visible: canViewNavItem('units')
    },
    { 
      to: "/locations", 
      icon: <MapPin size={isMobile ? 20 : 16} />,
      text: "Units Location",
      visible: canViewNavItem('locations')
    },
    { 
      to: "/filters", 
      icon: <Filter size={isMobile ? 20 : 16} />,
      text: "Filters",
      visible: canViewNavItem('filters')
    },
    { 
      to: "/uvc", 
      icon: <Zap size={isMobile ? 20 : 16} />,
      text: "UVC",
      visible: canViewNavItem('uvc')
    },
    { 
      to: "/alerts", 
      icon: <Bell size={isMobile ? 20 : 16} />,
      text: "Alerts",
      visible: canViewNavItem('alerts')
    },
    { 
      to: "/analytics", 
      icon: <BarChart2 size={isMobile ? 20 : 16} />,
      text: "Analytics",
      visible: canViewNavItem('analytics')
    },
    { 
      to: "/analytics?tab=predictive", 
      icon: <Activity size={isMobile ? 20 : 16} />,
      text: "Predictive Maintenance",
      visible: canViewNavItem('predictive')
    },
    { 
      to: "/users", 
      icon: <Users size={isMobile ? 20 : 16} />,
      text: "Users",
      visible: canViewNavItem('users')
    },
    { 
      to: "/client-requests", 
      icon: <MessageSquare size={isMobile ? 20 : 16} />,
      text: "Client Requests",
      visible: canViewNavItem('client-requests')
    },
    { 
      to: "/impact", 
      icon: <Droplet size={isMobile ? 20 : 16} />,
      text: "Impact",
      visible: canViewNavItem('impact')
    }
  ];

  return (
    <aside className={`${isMobile ? "w-64" : "w-60"} bg-spotify-darker/95 text-white border-r border-gray-800 h-screen flex flex-col backdrop-blur-md`}>
      <SidebarHeader userRole={userRole} isMobile={isMobile} closeSidebar={closeSidebar} />
      
      <div className="flex flex-col p-3 h-[calc(100%-60px)] overflow-y-auto">
        {/* Search bar for non-mobile */}
        {!isMobile && (
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-8 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-mywater-blue"
              />
              <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}
        
        <nav className="space-y-1 flex-1">
          {menuItems
            .filter(item => item.visible)
            .map((item, index) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <SidebarNavItem
                  to={item.to}
                  icon={item.icon}
                  isActive={location.pathname === item.to || 
                    (item.to.includes('?') && 
                     location.pathname === item.to.split('?')[0] && 
                     location.search.includes(item.to.split('?')[1]))}
                  isMobile={isMobile}
                  onClick={isMobile ? closeSidebar : undefined}
                >
                  {item.text}
                </SidebarNavItem>
              </motion.div>
            ))
          }
        </nav>
        
        <div className="mt-auto space-y-2">
          {/* Settings */}
          {canViewNavItem('settings') && (
            <SidebarNavItem 
              to="/settings" 
              icon={<Settings size={isMobile ? 20 : 16} />} 
              isActive={location.pathname === "/settings"}
              isMobile={isMobile}
              onClick={isMobile ? closeSidebar : undefined}
            >
              Settings
            </SidebarNavItem>
          )}
          
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 ${isMobile ? 'px-6 py-4' : 'px-4 py-3'} mt-2 rounded-md transition-colors text-gray-400 hover:text-white hover:bg-red-600/20 border border-transparent hover:border-red-600/30 bg-white/5`}
          >
            <Settings className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'} flex-shrink-0 text-red-500`} />
            <span className={`truncate font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

// Enhanced SidebarNavItem with mobile support
function SidebarNavItem({ 
  to, 
  icon, 
  isActive, 
  children, 
  isMobile, 
  onClick 
}: { 
  to: string; 
  icon: React.ReactNode; 
  isActive: boolean; 
  children: React.ReactNode;
  isMobile?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 ${isMobile ? 'px-6 py-4' : 'px-4 py-3'} rounded-md transition-all duration-200 ${
        isActive
          ? "bg-spotify-accent text-white shadow-lg"
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className={`truncate font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>{children}</span>
      
      {isActive && (
        <motion.div 
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"
          layoutId="activeIndicator"
        />
      )}
    </Link>
  );
}

// Enhanced SidebarHeader with mobile support
function SidebarHeader({ 
  userRole, 
  isMobile, 
  closeSidebar 
}: { 
  userRole: string | null; 
  isMobile?: boolean;
  closeSidebar?: () => void;
}) {
  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'superadmin': return 'text-red-400';
      case 'admin': return 'text-yellow-400';
      case 'technician': return 'text-blue-400';
      case 'user': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`${isMobile ? 'p-6' : 'p-4'} border-b border-gray-800 flex items-center justify-between`}>
      <div className="flex items-center">
        <div className={`${isMobile ? 'h-10 w-10' : 'h-8 w-8'} rounded-md bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center mr-3`}>
          <Droplet className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'} text-white`} />
        </div>
        <span className={`text-white font-bold ${isMobile ? 'text-xl' : 'text-lg'}`}>X-WATER</span>
      </div>
      
      <div className="flex items-center gap-2">
        {userRole && (
          <div className={`text-xs px-2 py-1 rounded ${getRoleColor(userRole)} bg-white/10`}>
            {userRole.toUpperCase()}
          </div>
        )}
        
        {isMobile && closeSidebar && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={closeSidebar}
            className="text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
