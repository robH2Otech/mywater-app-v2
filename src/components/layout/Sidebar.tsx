import { LayoutDashboard, Droplet, MapPin, Filter, Zap, Bell, BarChart2, Users, MessageSquare, Settings, Activity } from "lucide-react";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarLogoutButton } from "./SidebarLogoutButton";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function Sidebar() {
  const location = useLocation();
  const { t } = useTranslation();

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
            {t("Dashboard")}
          </SidebarNavItem>
          <SidebarNavItem 
            to="/units" 
            icon={<Droplet size={16} />} 
            isActive={location.pathname.startsWith("/units")}
          >
            {t("Water Units")}
          </SidebarNavItem>
          <SidebarNavItem 
            to="/locations" 
            icon={<MapPin size={16} />} 
            isActive={location.pathname.startsWith("/locations")}
          >
            {t("Units Location")}
          </SidebarNavItem>
          <SidebarNavItem 
            to="/filters" 
            icon={<Filter size={16} />} 
            isActive={location.pathname === "/filters"}
          >
            {t("Filters")}
          </SidebarNavItem>
          <SidebarNavItem 
            to="/uvc" 
            icon={<Zap size={16} />} 
            isActive={location.pathname === "/uvc"}
          >
            {t("UVC")}
          </SidebarNavItem>
          <SidebarNavItem 
            to="/alerts" 
            icon={<Bell size={16} />} 
            isActive={location.pathname === "/alerts"}
          >
            {t("Alerts")}
          </SidebarNavItem>
          <SidebarNavItem 
            to="/analytics" 
            icon={<BarChart2 size={16} />} 
            isActive={location.pathname === "/analytics"}
          >
            {t("Analytics")}
          </SidebarNavItem>
          <SidebarNavItem 
            to="/analytics?tab=predictive" 
            icon={<Activity size={16} />} 
            isActive={location.pathname === "/analytics" && location.search.includes("tab=predictive")}
          >
            {t("Predictive Maintenance")}
          </SidebarNavItem>
          <SidebarNavItem 
            to="/users" 
            icon={<Users size={16} />} 
            isActive={location.pathname === "/users"}
          >
            {t("Users")}
          </SidebarNavItem>
          <SidebarNavItem 
            to="/client-requests" 
            icon={<MessageSquare size={16} />} 
            isActive={location.pathname === "/client-requests"}
          >
            {t("Client Requests")}
          </SidebarNavItem>
        </nav>
        
        <div className="mt-auto">
          <SidebarNavItem 
            to="/settings" 
            icon={<Settings size={16} />} 
            isActive={location.pathname === "/settings"}
          >
            {t("Settings")}
          </SidebarNavItem>
          <SidebarLogoutButton />
        </div>
      </div>
    </aside>
  );
};
