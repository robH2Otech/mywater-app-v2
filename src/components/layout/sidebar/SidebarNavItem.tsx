
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface NavigationItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

interface SidebarNavItemProps {
  item: NavigationItem;
  isActive: boolean;
  onClick?: () => void;
}

export function SidebarNavItem({ item, isActive, onClick }: SidebarNavItemProps) {
  return (
    <Link
      to={item.path}
      className="relative block"
      onClick={onClick}
    >
      <motion.div
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-mywater-accent to-blue-600 text-white"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
        <span className="truncate">{item.name}</span>
        
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="activeSidebarItem"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </motion.div>
    </Link>
  );
}
