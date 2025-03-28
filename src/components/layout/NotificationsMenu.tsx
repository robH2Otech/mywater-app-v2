
import { useState } from "react";
import { Bell, Instagram, Facebook, Linkedin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationsList } from "./notifications/NotificationsList";
import { SocialLinks } from "./notifications/SocialLinks";
import { Notification } from "@/types/notifications";

export const NotificationsMenu = () => {
  const [socialPosts, setSocialPosts] = useState<Notification[]>([
    {
      id: "s1",
      title: "Instagram",
      content: "Discover our latest water purification technology! #CleanWater #Innovation",
      icon: <Instagram className="h-4 w-4 text-pink-500" />,
      time: "1 day ago",
      read: false,
      link: "https://www.instagram.com/mywatertechnologies",
      platform: 'instagram',
      type: 'social'
    },
    {
      id: "s2",
      title: "Facebook",
      content: "Join our webinar on sustainable water usage and learn how to reduce your environmental footprint!",
      icon: <Facebook className="h-4 w-4 text-blue-500" />,
      time: "2 days ago",
      read: false,
      link: "https://www.facebook.com/mywatertechnologies",
      platform: 'facebook',
      type: 'social'
    },
    {
      id: "s3",
      title: "LinkedIn",
      content: "MYWATER Technologies announces partnership with global sustainability initiative.",
      icon: <Linkedin className="h-4 w-4 text-blue-700" />,
      time: "3 days ago",
      read: false,
      link: "https://www.linkedin.com/company/mywatertechnologies",
      platform: 'linkedin',
      type: 'social'
    },
  ]);

  const [referralNotifications, setReferralNotifications] = useState<Notification[]>([
    {
      id: "r1",
      title: "Referral Sent",
      content: "Your invitation to Sarah was successfully delivered.",
      icon: <Instagram className="h-4 w-4 text-green-500" />,
      time: "5 hours ago",
      read: false,
      type: 'referral'
    },
  ]);

  const allNotifications = [...socialPosts, ...referralNotifications];
  const unreadCount = allNotifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    // Check in social posts
    setSocialPosts(
      socialPosts.map((post) =>
        post.id === id ? { ...post, read: true } : post
      )
    );
    
    // Check in referral notifications
    setReferralNotifications(
      referralNotifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setSocialPosts(
      socialPosts.map((post) => ({ ...post, read: true }))
    );
    setReferralNotifications(
      referralNotifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  const handleItemClick = (id: string, link?: string) => {
    markAsRead(id);
    
    // If it has a link, open it in a new tab
    if (link) {
      window.open(link, '_blank');
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
        
        {/* Referral Notifications */}
        <NotificationsList 
          title="Referrals"
          notifications={referralNotifications}
          onMarkAsRead={markAsRead}
          onItemClick={handleItemClick}
        />
        
        {referralNotifications.length > 0 && socialPosts.length > 0 && (
          <DropdownMenuSeparator className="bg-gray-700" />
        )}
        
        {/* Social Media Posts */}
        <NotificationsList 
          title="Social Media"
          notifications={socialPosts}
          onMarkAsRead={markAsRead}
          onItemClick={handleItemClick}
        />
        
        <DropdownMenuSeparator className="bg-gray-700" />
        
        {/* Follow Links */}
        <SocialLinks />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
