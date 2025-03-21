
import { useState } from "react";
import { Bell, AlertTriangle, Info, DropletIcon, Instagram, Facebook, Linkedin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  time: string;
  read: boolean;
}

interface SocialPost {
  id: string;
  platform: "instagram" | "facebook" | "linkedin";
  content: string;
  date: string;
  url: string;
}

export const NotificationsMenu = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Water Alert",
      content: "Usage spike detected in Unit MYWATER_002",
      icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      time: "2 min ago",
      read: false,
    },
    {
      id: "2",
      title: "System Update",
      content: "New firmware version available",
      icon: <Info className="h-4 w-4 text-blue-500" />,
      time: "15 min ago",
      read: false,
    },
    {
      id: "3",
      title: "Filter Maintenance",
      content: "Filter change required for MYWATER_003",
      icon: <DropletIcon className="h-4 w-4 text-primary" />,
      time: "3 hours ago",
      read: true,
    },
  ]);
  
  // Add social media posts
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([
    {
      id: "1",
      platform: "instagram",
      content: "Join our water conservation challenge this month! #MYWATER #SaveWater",
      date: "2 days ago",
      url: "https://instagram.com/mywatertechnologies"
    },
    {
      id: "2",
      platform: "facebook",
      content: "MYWATER is proud to announce our new eco-friendly packaging initiative.",
      date: "1 week ago",
      url: "https://facebook.com/mywatertechnologies"
    },
    {
      id: "3",
      platform: "linkedin",
      content: "MYWATER Technologies partners with leading research institutions to improve water quality.",
      date: "3 days ago",
      url: "https://linkedin.com/company/mywatertechnologies"
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };
  
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-4 w-4 text-pink-500" />;
      case "facebook":
        return <Facebook className="h-4 w-4 text-blue-500" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4 text-blue-700" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  const openSocialUrl = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-primary text-[10px] text-white" 
              variant="outline"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-spotify-darker border-spotify-accent"
      >
        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
          <h3 className="font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-gray-400 hover:text-white"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        {/* Regular notifications */}
        <div className="max-h-[200px] overflow-y-auto py-2">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`px-4 py-3 cursor-pointer flex items-start gap-3 ${
                  notification.read 
                    ? "text-gray-400 hover:bg-gray-800 hover:text-gray-300" 
                    : "text-white hover:bg-spotify-accent bg-gray-800/50"
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex-shrink-0 mt-1">{notification.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="font-medium">{notification.title}</p>
                    <span className="text-xs text-gray-500">{notification.time}</span>
                  </div>
                  <p className="text-sm truncate mt-1">{notification.content}</p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-gray-500">
              <p>No notifications</p>
            </div>
          )}
        </div>
        
        <DropdownMenuSeparator className="bg-gray-700" />
        
        {/* Social media feed section */}
        <div className="px-4 py-2 border-b border-gray-700">
          <h3 className="font-semibold text-white">Follow Us</h3>
          <p className="text-xs text-gray-400">Stay updated with MYWATER</p>
        </div>
        
        <div className="max-h-[200px] overflow-y-auto py-2">
          {socialPosts.map((post) => (
            <DropdownMenuItem
              key={post.id}
              className="px-4 py-3 cursor-pointer flex items-start gap-3 text-white hover:bg-spotify-accent"
              onClick={() => openSocialUrl(post.url)}
            >
              <div className="flex-shrink-0 mt-1">
                {getPlatformIcon(post.platform)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="font-medium capitalize">{post.platform}</p>
                  <span className="text-xs text-gray-500">{post.date}</span>
                </div>
                <p className="text-sm mt-1">{post.content}</p>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem className="px-4 py-2 text-center text-gray-400 hover:text-white cursor-pointer hover:bg-spotify-accent">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
