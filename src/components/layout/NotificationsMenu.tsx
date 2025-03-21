
import { useState } from "react";
import { Bell, AlertTriangle, Info, DropletIcon, Instagram, Facebook, Linkedin, ExternalLink } from "lucide-react";
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
  link?: string;
  platform?: 'instagram' | 'facebook' | 'linkedin';
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

  const [socialPosts, setSocialPosts] = useState<Notification[]>([
    {
      id: "s1",
      title: "Instagram",
      content: "Discover our latest water purification technology! #CleanWater #Innovation",
      icon: <Instagram className="h-4 w-4 text-pink-500" />,
      time: "1 day ago",
      read: false,
      link: "https://www.instagram.com/mywatertechnologies",
      platform: 'instagram'
    },
    {
      id: "s2",
      title: "Facebook",
      content: "Join our webinar on sustainable water usage and learn how to reduce your environmental footprint!",
      icon: <Facebook className="h-4 w-4 text-blue-500" />,
      time: "2 days ago",
      read: false,
      link: "https://www.facebook.com/mywatertechnologies",
      platform: 'facebook'
    },
    {
      id: "s3",
      title: "LinkedIn",
      content: "MYWATER Technologies announces partnership with global sustainability initiative.",
      icon: <Linkedin className="h-4 w-4 text-blue-700" />,
      time: "3 days ago",
      read: false,
      link: "https://www.linkedin.com/company/mywatertechnologies",
      platform: 'linkedin'
    },
  ]);

  const allNotifications = [...notifications, ...socialPosts];
  const unreadCount = allNotifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    // Mark notification as read
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    
    // Also check in social posts
    setSocialPosts(
      socialPosts.map((post) =>
        post.id === id ? { ...post, read: true } : post
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
    setSocialPosts(
      socialPosts.map((post) => ({ ...post, read: true }))
    );
  };

  const handleItemClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // If it has a link, open it in a new tab
    if (notification.link) {
      window.open(notification.link, '_blank');
    }
  };

  const getPlatformColor = (platform?: 'instagram' | 'facebook' | 'linkedin') => {
    switch (platform) {
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'facebook':
        return 'bg-blue-600';
      case 'linkedin':
        return 'bg-blue-700';
      default:
        return '';
    }
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
          <h3 className="font-semibold text-white">Notifications & Social</h3>
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
        
        {/* System Notifications */}
        {notifications.length > 0 && (
          <div className="py-2">
            <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
              System Notifications
            </div>
            {notifications.map((notification) => (
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
            ))}
          </div>
        )}
        
        <DropdownMenuSeparator className="bg-gray-700" />
        
        {/* Social Media Posts */}
        <div className="py-2">
          <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
            Social Media
          </div>
          {socialPosts.map((post) => (
            <DropdownMenuItem
              key={post.id}
              className={`px-4 py-3 cursor-pointer flex items-start gap-3 ${
                post.read 
                  ? "text-gray-400 hover:bg-gray-800 hover:text-gray-300" 
                  : "text-white hover:bg-spotify-accent bg-gray-800/50"
              }`}
              onClick={() => handleItemClick(post)}
            >
              <div className={`flex-shrink-0 p-1 rounded-full ${getPlatformColor(post.platform)} flex items-center justify-center mt-1`}>
                {post.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="font-medium flex items-center">
                    {post.title}
                    {post.link && <ExternalLink className="ml-1 h-3 w-3" />}
                  </p>
                  <span className="text-xs text-gray-500">{post.time}</span>
                </div>
                <p className="text-sm mt-1 line-clamp-2">{post.content}</p>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        
        <DropdownMenuSeparator className="bg-gray-700" />
        
        {/* Follow Links */}
        <div className="px-4 py-3 text-center">
          <p className="text-sm text-gray-400 mb-2">Follow MYWATER Technologies</p>
          <div className="flex justify-center space-x-4">
            <a 
              href="https://www.instagram.com/mywatertechnologies" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-500 hover:text-pink-400"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a 
              href="https://www.facebook.com/mywatertechnologies" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a 
              href="https://www.linkedin.com/company/mywatertechnologies" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-600"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
