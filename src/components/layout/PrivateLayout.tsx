
import { useState } from "react";
import { PrivateSidebar } from "./PrivateSidebar";
import { Header } from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

export const PrivateLayout = ({ children }: PrivateLayoutProps) => {
  const isMobile = useIsMobile();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  return (
    <div className="min-h-screen bg-spotify-dark flex relative">
      {/* Mobile sidebar overlay with blur effect */}
      {isMobile && showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 z-40 animate-fadeIn backdrop-blur-sm"
          onClick={toggleMobileSidebar}
        />
      )}
      
      {/* Enhanced sidebar animation */}
      <div 
        className={`${isMobile ? "fixed top-0 left-0 z-50" : "fixed"} 
                  ${isMobile && !showMobileSidebar ? "-translate-x-full" : "translate-x-0"} 
                  transition-transform duration-300 ease-in-out h-screen shadow-2xl`}
      >
        <PrivateSidebar isMobile={isMobile} closeSidebar={toggleMobileSidebar} />
      </div>

      {/* Main content */}
      <div className={`flex-1 ${isMobile ? "pl-0" : "pl-64"}`}>
        <Header>
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileSidebar}
              className="mr-2 text-white bg-gradient-to-r hover:bg-gradient-to-br from-cyan-700/30 to-blue-700/30"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}
        </Header>
        <main className="p-2 md:p-4 lg:p-6 max-w-[2000px] mx-auto">{children}</main>
      </div>
    </div>
  );
}
