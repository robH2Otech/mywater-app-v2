
import { Card, CardContent } from "@/components/ui/card";
import { User, UserRole } from "@/types/users";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { MailCheck, PhoneCall } from "lucide-react";

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
        <div className="flex items-center space-x-3">
          <UserAvatar 
            firstName={user.first_name} 
            lastName={user.last_name}
            className="h-12 w-12 flex-shrink-0"
            showMenu={false}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-white truncate">{user.first_name} {user.last_name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded ${getRoleBadgeColor(user.role)} text-white uppercase`}>
                {user.role}
              </span>
            </div>
            
            <div className="mt-1 flex items-center text-sm text-gray-400">
              <MailCheck className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            
            {user.phone && (
              <div className="mt-1 flex items-center text-sm text-gray-400">
                <PhoneCall className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
