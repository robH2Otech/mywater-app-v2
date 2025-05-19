
import { useState } from "react";
import { PrivateSidebar } from "./PrivateSidebar";
import { Header } from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

export const PrivateLayout = ({ children }: PrivateLayoutProps) => {
  const isMobile = useIsMobile();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  const toggleSidebar = () => {
    if (!isMobile) {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mywater-dark to-spotify-dark flex relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-mywater-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-mywater-secondary/5 rounded-full blur-3xl" />
        
        {/* Additional subtle animated background orbs */}
        <motion.div 
          animate={{ 
            x: [0, 50, 0], 
            y: [0, -30, 0], 
            opacity: [0.05, 0.07, 0.05] 
          }} 
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
          className="absolute top-1/4 right-1/4 w-72 h-72 bg-mywater-accent/10 rounded-full blur-3xl"
        />
      </div>

      {/* Mobile sidebar overlay with blur effect */}
      <AnimatePresence>
        {isMobile && showMobileSidebar && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
            onClick={toggleMobileSidebar}
          />
        )}
      </AnimatePresence>
      
      {/* Enhanced sidebar animation */}
      <div className="flex w-full">
        <motion.div 
          className={`${isMobile ? "fixed top-0 left-0 z-50 h-screen" : "h-screen"}`}
          animate={{ 
            width: isMobile 
              ? showMobileSidebar ? "250px" : "0px"
              : sidebarCollapsed ? "80px" : "260px"
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
        >
          <div className="h-full overflow-hidden">
            <PrivateSidebar 
              isMobile={isMobile} 
              closeSidebar={toggleMobileSidebar} 
              collapsed={!isMobile && sidebarCollapsed}
              toggleSidebar={toggleSidebar}
            />
          </div>
        </motion.div>

        {/* Main content - no margin-left to eliminate the gap */}
        <div className="flex-1 flex flex-col">
          <Header>
            <div className="flex items-center gap-2">
              {isMobile ? (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleMobileSidebar}
                  className="mr-2 text-white hover:bg-white/10 transition-colors"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleSidebar}
                  className="mr-2 text-white hover:bg-white/10 transition-colors"
                >
                  {sidebarCollapsed ? (
                    <Menu className="h-5 w-5" />
                  ) : (
                    <X className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
              )}
            </div>
          </Header>
          <main className="p-3 md:p-4 lg:p-6 flex-1 max-w-[2000px] w-full mx-auto relative z-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
