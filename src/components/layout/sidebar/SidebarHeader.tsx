
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SidebarHeaderProps {
  isMobile?: boolean;
  closeSidebar?: () => void;
}

export function SidebarHeader({ isMobile, closeSidebar }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-2">
        <img src="/lovable-uploads/f2f80940-5fa8-45b6-a3dd-78b6282cf10e.png" alt="Water Filter" className="h-8 w-8 object-contain" />
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-white leading-tight">MYWATER</h1>
          <span className="text-sm text-white/80">Private User</span>
        </div>
      </div>
      
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={closeSidebar}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close menu</span>
        </Button>
      )}
    </div>
  );
}
