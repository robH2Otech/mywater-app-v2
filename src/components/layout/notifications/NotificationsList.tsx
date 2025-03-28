
import { useState } from "react";
import { Instagram, Facebook, Linkedin } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { Button } from "@/components/ui/button";

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

interface NotificationsListProps {
  title: string;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onItemClick: (id: string, link?: string) => void;
}

export const NotificationsList = ({ 
  title, 
  notifications, 
  onMarkAsRead, 
  onItemClick 
}: NotificationsListProps) => {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="py-2">
      <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
        {title}
      </div>
      {notifications.map((notification) => (
        <NotificationItem 
          key={notification.id}
          {...notification}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
};
