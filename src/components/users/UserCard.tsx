
import { Card, CardContent } from "@/components/ui/card";
import { User, UserRole } from "@/types/users";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { MailCheck, PhoneCall, Briefcase } from "lucide-react";

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

  return (
    <Card 
      className="hover:border-mywater-blue cursor-pointer transition-all duration-300 bg-spotify-darker border-spotify-accent"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-3">
            <UserAvatar 
              firstName={user.first_name} 
              lastName={user.last_name}
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-medium text-white truncate">
                {user.first_name} {user.last_name}
              </h3>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded ${getRoleBadgeColor(user.role)} text-white uppercase inline-block`}>
                  {user.role}
                </span>
                {user.company && (
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-white inline-block">
                    {user.company}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="pl-2">
            <div className="flex items-center text-sm text-gray-400">
              <MailCheck className="h-3 w-3 mr-2 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            
            {user.phone && (
              <div className="flex items-center text-sm text-gray-400 mt-1">
                <PhoneCall className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="truncate">{user.phone}</span>
              </div>
            )}
            
            {user.job_title && (
              <div className="flex items-center text-sm text-gray-400 mt-1">
                <Briefcase className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="truncate">{user.job_title}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
