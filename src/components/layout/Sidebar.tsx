
import { LayoutDashboard, Droplet, MapPin, Filter, Zap, Bell, BarChart2, Users, MessageSquare, Settings, Activity } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { auth } from "@/integrations/firebase/client";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    userRole, 
    canViewNavItem, 
    isSuperAdmin, 
    isAdmin, 
    isTechnician, 
    isCompanyUser 
  } = usePermissions();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Define menu items with role-based visibility using the permission system
  const menuItems = [
    { 
      to: "/dashboard", 
      icon: <LayoutDashboard size={16} />,
      text: "Dashboard",
      visible: canViewNavItem('dashboard')
    },
    { 
      to: "/units", 
      icon: <Droplet size={16} />,
      text: "Water Units",
      visible: canViewNavItem('units')
    },
    { 
      to: "/locations", 
      icon: <MapPin size={16} />,
      text: "Units Location",
      visible: canViewNavItem('locations')
    },
    { 
      to: "/filters", 
      icon: <Filter size={16} />,
      text: "Filters",
      visible: canViewNavItem('filters')
    },
    { 
      to: "/uvc", 
      icon: <Zap size={16} />,
      text: "UVC",
      visible: canViewNavItem('uvc')
    },
    { 
      to: "/alerts", 
      icon: <Bell size={16} />,
      text: "Alerts",
      visible: canViewNavItem('alerts')
    },
    { 
      to: "/analytics", 
      icon: <BarChart2 size={16} />,
      text: "Analytics",
      visible: canViewNavItem('analytics')
    },
    { 
      to: "/analytics?tab=predictive", 
      icon: <Activity size={16} />,
      text: "Predictive Maintenance",
      visible: canViewNavItem('predictive')
    },
    { 
      to: "/users", 
      icon: <Users size={16} />,
      text: "Users",
      visible: canViewNavItem('users') // Only admins and superadmins
    },
    { 
      to: "/client-requests", 
      icon: <MessageSquare size={16} />,
      text: "Client Requests",
      visible: canViewNavItem('client-requests')
    },
    { 
      to: "/impact", 
      icon: <Droplet size={16} />,
      text: "Impact",
      visible: canViewNavItem('impact')
    }
  ];

  return (
    <aside className="w-60 bg-spotify-darker text-white border-r border-gray-800 hidden md:block fixed h-full overflow-y-auto z-20">
      <SidebarHeader userRole={userRole} />
      
      <div className="flex flex-col p-3 h-[calc(100%-60px)]">
        <nav className="space-y-1 flex-1">
          {menuItems
            .filter(item => item.visible)
            .map((item) => (
              <SidebarNavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                isActive={location.pathname === item.to || 
                  (item.to.includes('?') && 
                   location.pathname === item.to.split('?')[0] && 
                   location.search.includes(item.to.split('?')[1]))}
              >
                {item.text}
              </SidebarNavItem>
            ))
          }
        </nav>
        
        <div className="mt-auto">
          {/* Settings only visible to non-technicians */}
          {canViewNavItem('settings') && (
            <SidebarNavItem 
              to="/settings" 
              icon={<Settings size={16} />} 
              isActive={location.pathname === "/settings"}
            >
              Settings
            </SidebarNavItem>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-md transition-colors text-gray-400 hover:text-white hover:bg-red-600/20 border border-transparent hover:border-red-600/30 bg-white/5"
          >
            <Settings className="h-5 w-5 flex-shrink-0 text-red-500" />
            <span className="truncate font-medium">Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

// Internal component for SidebarNavItem
function SidebarNavItem({ to, icon, isActive, children }: { to: string; icon: React.ReactNode; isActive: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
        isActive
          ? "bg-spotify-accent text-white"
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="truncate font-medium">{children}</span>
      
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
      )}
    </Link>
  );
}

// Internal component for SidebarHeader with role indicator
function SidebarHeader({ userRole }: { userRole: string | null }) {
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
    <div className="p-4 border-b border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center mr-2">
            <Droplet className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">X-WATER</span>
        </div>
        {userRole && (
          <div className={`text-xs px-2 py-1 rounded ${getRoleColor(userRole)} bg-white/10`}>
            {userRole.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
