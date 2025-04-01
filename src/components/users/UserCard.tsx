
import { Card, CardContent } from "@/components/ui/card";
import { User, UserRole } from "@/types/users";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { Mail, Phone } from "lucide-react";

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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card 
      className="hover:border-mywater-blue cursor-pointer transition-all duration-300 bg-spotify-darker border-spotify-accent"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-mywater-blue flex items-center justify-center text-white text-xl font-bold mr-4">
              {getInitials(user.first_name, user.last_name)}
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">
                {user.first_name} {user.last_name}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded ${getRoleBadgeColor(user.role)} text-white uppercase inline-block mt-1`}>
                {user.role.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-300">
              <Mail className="h-4 w-4 mr-2" />
              <span>{user.email}</span>
            </div>
            
            {user.phone && (
              <div className="flex items-center text-sm text-gray-300">
                <Phone className="h-4 w-4 mr-2" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
