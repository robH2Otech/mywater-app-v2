
import { LayoutDashboard, Droplet, MapPin, Filter, Zap, Bell, BarChart2, Users, MessageSquare, Settings, Activity } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { auth } from "@/integrations/firebase/client";
import { useNavigate } from "react-router-dom";

// We'll use our own components instead of importing from non-existent files
export function Sidebar() {
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

  return (
    <aside className="w-60 bg-spotify-darker text-white border-r border-gray-800 hidden md:block fixed h-full overflow-y-auto z-20">
      <SidebarHeader />
      
      <div className="flex flex-col p-3 h-[calc(100%-60px)]">
        <nav className="space-y-1 flex-1">
          <SidebarNavItem 
            to="/dashboard" 
            icon={<LayoutDashboard size={16} />} 
            isActive={location.pathname === "/dashboard"}
          >
            Dashboard
          </SidebarNavItem>
          <SidebarNavItem 
            to="/units" 
            icon={<Droplet size={16} />} 
            isActive={location.pathname.startsWith("/units")}
          >
            Water Units
          </SidebarNavItem>
          <SidebarNavItem 
            to="/locations" 
            icon={<MapPin size={16} />} 
            isActive={location.pathname.startsWith("/locations")}
          >
            Units Location
          </SidebarNavItem>
          <SidebarNavItem 
            to="/filters" 
            icon={<Filter size={16} />} 
            isActive={location.pathname === "/filters"}
          >
            Filters
          </SidebarNavItem>
          <SidebarNavItem 
            to="/uvc" 
            icon={<Zap size={16} />} 
            isActive={location.pathname === "/uvc"}
          >
            UVC
          </SidebarNavItem>
          <SidebarNavItem 
            to="/alerts" 
            icon={<Bell size={16} />} 
            isActive={location.pathname === "/alerts"}
          >
            Alerts
          </SidebarNavItem>
          <SidebarNavItem 
            to="/analytics" 
            icon={<BarChart2 size={16} />} 
            isActive={location.pathname === "/analytics" && !location.search.includes("tab=predictive")}
          >
            Analytics
          </SidebarNavItem>
          <SidebarNavItem 
            to="/analytics?tab=predictive" 
            icon={<Activity size={16} />} 
            isActive={location.pathname === "/analytics" && location.search.includes("tab=predictive")}
          >
            Predictive Maintenance
          </SidebarNavItem>
          <SidebarNavItem 
            to="/users" 
            icon={<Users size={16} />} 
            isActive={location.pathname === "/users"}
          >
            Users
          </SidebarNavItem>
          <SidebarNavItem 
            to="/client-requests" 
            icon={<MessageSquare size={16} />} 
            isActive={location.pathname === "/client-requests"}
          >
            Client Requests
          </SidebarNavItem>
        </nav>
        
        <div className="mt-auto">
          <SidebarNavItem 
            to="/settings" 
            icon={<Settings size={16} />} 
            isActive={location.pathname === "/settings"}
          >
            Settings
          </SidebarNavItem>
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

// Internal component for SidebarHeader
function SidebarHeader() {
  return (
    <div className="p-4 border-b border-gray-800">
      <div className="flex items-center">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center mr-2">
            <Droplet className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">X-WATER</span>
        </div>
      </div>
    </div>
  );
}
