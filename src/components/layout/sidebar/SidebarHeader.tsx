
import { X, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface SidebarHeaderProps {
  closeSidebar?: () => void;
  isMobile?: boolean;
  collapsed?: boolean;
}

export function SidebarHeader({ closeSidebar, isMobile, collapsed = false }: SidebarHeaderProps) {
  return (
    <div className="border-b border-white/10 py-4">
      <div className={`flex ${collapsed ? 'justify-center' : 'justify-between'} px-4 items-center`}>
        <div className="flex items-center">
          {collapsed ? (
            <div className="flex-shrink-0 h-8 w-8 rounded-md bg-gradient-to-r from-mywater-accent to-blue-600 flex items-center justify-center">
              <Droplets className="h-5 w-5 text-primary" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <div className="flex-shrink-0 h-8 rounded-md bg-gradient-to-r from-mywater-accent to-blue-600 flex items-center justify-center px-3">
                <Droplets className="h-5 w-5 text-primary mr-1" />
                <span className="text-white font-bold text-lg">X-WATER</span>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Close button only for mobile */}
        {isMobile && !collapsed && (
          <Button variant="ghost" size="icon" onClick={closeSidebar}>
            <X className="h-5 w-5 text-gray-400" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}
      </div>
    </div>
  );
}
