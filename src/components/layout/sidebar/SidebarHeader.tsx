
import { X } from "lucide-react";
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
          <div className="flex-shrink-0">
            {collapsed ? (
              <img 
                src="/logo-icon.svg" 
                alt="Logo" 
                width={30} 
                height={30} 
                className="h-8 w-8" 
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/30x30?text=M';
                }}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center"
              >
                <img 
                  src="/logo.svg" 
                  alt="MYWATER" 
                  width={120} 
                  height={30} 
                  className="h-8" 
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/120x30?text=MYWATER';
                  }}
                />
              </motion.div>
            )}
          </div>
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
