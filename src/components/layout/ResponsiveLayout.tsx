
import { useState } from "react";
import { useResponsive, useIsTouchDevice } from "@/hooks/use-responsive";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export const ResponsiveLayout = ({ children }: ResponsiveLayoutProps) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const isTouchDevice = useIsTouchDevice();
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

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-spotify-dark flex flex-col relative overflow-hidden">
        {/* Mobile backdrop */}
        <AnimatePresence>
          {showMobileSidebar && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
              onClick={toggleMobileSidebar}
            />
          )}
        </AnimatePresence>
        
        {/* Mobile Header */}
        <Header>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMobileSidebar}
            className="mr-2 text-white hover:bg-white/10 transition-colors"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </Header>

        {/* Mobile Sidebar */}
        <motion.div 
          className="fixed top-0 left-0 z-50 h-screen"
          animate={{ 
            x: showMobileSidebar ? "0%" : "-100%"
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
        >
          <Sidebar 
            isMobile={true} 
            closeSidebar={toggleMobileSidebar}
            isOpen={showMobileSidebar}
          />
        </motion.div>

        {/* Mobile Main Content */}
        <main className="flex-1 p-4 overflow-x-hidden">
          {children}
        </main>
      </div>
    );
  }

  // Tablet Layout
  if (isTablet) {
    return (
      <div className="min-h-screen bg-spotify-dark flex relative">
        {/* Tablet Sidebar */}
        <motion.div 
          className="h-screen"
          animate={{ 
            width: sidebarCollapsed ? "80px" : "240px"
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
        >
          <Sidebar 
            isMobile={false} 
            closeSidebar={() => {}}
            isOpen={!sidebarCollapsed}
          />
        </motion.div>

        {/* Tablet Main Content */}
        <div className="flex-1 flex flex-col">
          <Header>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="mr-2 text-white hover:bg-white/10 transition-colors"
            >
              {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </Header>
          <main className="flex-1 p-6 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-spotify-dark flex relative">
      {/* Desktop Sidebar */}
      <motion.div 
        className="h-screen"
        animate={{ 
          width: sidebarCollapsed ? "80px" : "260px"
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30 
        }}
      >
        <Sidebar 
          isMobile={false} 
          closeSidebar={() => {}}
          isOpen={!sidebarCollapsed}
        />
      </motion.div>

      {/* Desktop Main Content */}
      <div className="flex-1 flex flex-col">
        <Header>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="mr-2 text-white hover:bg-white/10 transition-colors"
          >
            {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </Header>
        <main className="flex-1 p-8 max-w-[2000px] mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
