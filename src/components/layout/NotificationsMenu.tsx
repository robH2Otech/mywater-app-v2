
import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface NotificationsMenuProps {
  isMobile?: boolean;
}

export const NotificationsMenu = ({ isMobile: propIsMobile }: NotificationsMenuProps) => {
  const hookIsMobile = useIsMobile();
  const isMobile = propIsMobile !== undefined ? propIsMobile : hookIsMobile;
  const [isOpen, setIsOpen] = useState(false);

  // Mock notifications - replace with real data
  const notifications = [
    {
      id: 1,
      title: "System Alert",
      message: "Unit #123 requires maintenance",
      time: "5 min ago",
      unread: true
    },
    {
      id: 2,
      title: "Weekly Report",
      message: "Your weekly report is ready",
      time: "1 hour ago",
      unread: true
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size={isMobile ? "sm" : "icon"}
          className="relative text-white hover:bg-white/10 transition-colors"
        >
          <Bell className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className={`absolute -top-1 -right-1 ${isMobile ? 'h-4 w-4 text-xs' : 'h-5 w-5 text-xs'} rounded-full p-0 flex items-center justify-center`}
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={`${isMobile ? 'w-80' : 'w-96'} bg-spotify-darker border-gray-700 shadow-xl`}
        align="end"
        sideOffset={8}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white`}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    notification.unread
                      ? "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20"
                      : "bg-gray-800/50 border-gray-700 hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-white truncate`}>
                        {notification.title}
                      </h4>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400 mt-1`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notification.time}
                      </p>
                    </div>
                    {notification.unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">No notifications</p>
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="border-t border-gray-700 pt-2">
              <Button 
                variant="ghost" 
                className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                size={isMobile ? "sm" : "default"}
              >
                Mark all as read
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
