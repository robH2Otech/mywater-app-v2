
import { Card, CardContent } from "@/components/ui/card";
import { User, UserRole } from "@/types/users";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { UserPlus, MailCheck, PhoneCall, Building, Badge } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface UserCardProps {
  user: User;
  onClick: () => void;
}

export function UserCard({ user, onClick }: UserCardProps) {
  // Map role to badge color
  const getRoleBadgeColor = (role: UserRole) => {
    switch(role) {
      case "superadmin": return "bg-red-500";
      case "admin": return "bg-blue-500";
      case "technician": return "bg-yellow-500";
      case "user": 
      default: return "bg-green-500";
    }
  };
  
  // Get formatted date
  const getFormattedDate = (date: string | Date) => {
    if (!date) return "N/A";
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <Card 
      className="hover:border-mywater-blue cursor-pointer transition-all duration-300 bg-spotify-darker border-spotify-accent"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <UserAvatar 
              firstName={user.first_name} 
              lastName={user.last_name}
              className="h-14 w-14"
              showMenu={false}
            />
            <div>
              <div className="flex items-center">
                <h3 className="text-lg font-medium text-white">{user.first_name} {user.last_name}</h3>
                <div className={`ml-2 h-2 w-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : user.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                <span className={`ml-2 text-xs px-2 py-1 rounded ${getRoleBadgeColor(user.role)} text-white uppercase`}>
                  {user.role}
                </span>
              </div>
              <div className="mt-1 flex items-center text-sm text-gray-400">
                <MailCheck className="h-3 w-3 mr-1" />
                {user.email}
              </div>
              
              {user.phone && (
                <div className="mt-1 flex items-center text-sm text-gray-400">
                  <PhoneCall className="h-3 w-3 mr-1" />
                  {user.phone}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-xs text-gray-400">
              <UserPlus className="h-3 w-3 inline mr-1" />
              {getFormattedDate(user.created_at || new Date())}
            </span>
            {user.company && (
              <div className="mt-1 text-sm text-gray-400">
                <Building className="h-3 w-3 inline mr-1" />
                {user.company}
              </div>
            )}
            {user.job_title && (
              <div className="mt-1 text-sm text-gray-400">
                <Badge className="h-3 w-3 inline mr-1" />
                {user.job_title}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
