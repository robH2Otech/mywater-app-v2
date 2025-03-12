
import { Home, Droplets, Filter, Bell, BarChart2, Users, Settings, Lightbulb } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navigation = [
  { name: "Dashboard", icon: Home, path: "/" },
  { name: "Water Units", icon: Droplets, path: "/units" },
  { name: "Filters", icon: Filter, path: "/filters" },
  { name: "UVC", icon: Lightbulb, path: "/uvc" },
  { name: "Alerts", icon: Bell, path: "/alerts" },
  { name: "Analytics", icon: BarChart2, path: "/analytics" },
  { name: "Users", icon: Users, path: "/users" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-spotify-darker border-r border-white/10 p-4 animate-slideIn">
      <div className="flex items-center gap-2 mb-8">
        <Droplets className="h-8 w-8 text-spotify-green" />
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-white leading-tight">MYWATER</h1>
          <span className="text-sm text-white/80">Technologies</span>
        </div>
      </div>
      
      <nav className="space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? "bg-spotify-green text-white"
                  : "text-gray-400 hover:text-white hover:bg-spotify-accent"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
