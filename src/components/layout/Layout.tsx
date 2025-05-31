
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  return (
    <div className="min-h-screen bg-spotify-dark flex relative overflow-hidden">
      {/* Mobile sidebar backdrop with blur effect */}
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
      
      {/* Enhanced sidebar with smooth animations */}
      <motion.div 
        className={`${isMobile ? "fixed top-0 left-0 z-50 h-screen" : "fixed"} 
                  ${isMobile && !showMobileSidebar ? "-translate-x-full" : "translate-x-0"}`}
        animate={{ 
          x: isMobile && !showMobileSidebar ? "-100%" : "0%"
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30 
        }}
      >
        <Sidebar 
          isMobile={isMobile} 
          closeSidebar={toggleMobileSidebar}
          isOpen={showMobileSidebar}
        />
      </motion.div>

      {/* Main content with responsive padding */}
      <div className={`flex-1 ${isMobile ? "pl-0" : "pl-64"} flex flex-col min-h-screen`}>
        <Header>
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileSidebar}
              className="mr-2 text-white hover:bg-white/10 transition-colors"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}
        </Header>
        <main className="flex-1 p-2 md:p-4 lg:p-6 max-w-[2000px] mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
