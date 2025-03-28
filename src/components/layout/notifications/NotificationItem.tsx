
import { ExternalLink } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface NotificationProps {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  time: string;
  read: boolean;
  link?: string;
  platform?: 'instagram' | 'facebook' | 'linkedin';
  onItemClick: (id: string, link?: string) => void;
}

export const getPlatformColor = (platform?: 'instagram' | 'facebook' | 'linkedin') => {
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

export const NotificationItem = ({
  id,
  title,
  content,
  icon,
  time,
  read,
  link,
  platform,
  onItemClick
}: NotificationProps) => {
  return (
    <DropdownMenuItem
      key={id}
      className={`px-4 py-3 cursor-pointer flex items-start gap-3 ${
        read 
          ? "text-gray-400 hover:bg-gray-800 hover:text-gray-300" 
          : "text-white hover:bg-spotify-accent bg-gray-800/50"
      }`}
      onClick={() => onItemClick(id, link)}
    >
      <div className={`flex-shrink-0 p-1 rounded-full ${platform ? getPlatformColor(platform) : ''} flex items-center justify-center mt-1`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <p className="font-medium flex items-center">
            {title}
            {link && <ExternalLink className="ml-1 h-3 w-3" />}
          </p>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="text-sm mt-1 line-clamp-2">{content}</p>
      </div>
    </DropdownMenuItem>
  );
};
