
import { Card, CardContent } from "@/components/ui/card";
import { User, UserRole } from "@/types/users";
import { Mail, Phone } from "lucide-react";

interface UserCardProps {
  user: User;
  onClick: () => void;
}

export function UserCard({ user, onClick }: UserCardProps) {
  // Map role to badge color and text
  const getRoleBadge = (role: UserRole) => {
    switch(role) {
      case "superadmin": 
        return { bg: "bg-green-500", text: "SUPER ADMIN" };
      case "admin": 
        return { bg: "bg-blue-500", text: "ADMIN" };
      case "technician": 
        return { bg: "bg-yellow-500", text: "TECHNICIAN" };
      case "user": 
      default: 
        return { bg: "bg-gray-500", text: "USER" };
    }
  };

  // Get user initials for the avatar
  const getInitials = () => {
    const firstInitial = user.first_name ? user.first_name.charAt(0) : '';
    const lastInitial = user.last_name ? user.last_name.charAt(0) : '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <Card 
      className="hover:border-mywater-blue cursor-pointer transition-all duration-300 bg-spotify-darker border-spotify-accent"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-3">
            <div className="h-14 w-14 rounded-full bg-mywater-blue flex items-center justify-center text-white font-bold text-lg">
              {getInitials()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-medium text-white">
                {user.first_name} {user.last_name}
              </h3>
              <div className="mt-1">
                <span className={`text-xs px-2 py-1 rounded ${roleBadge.bg} text-white uppercase inline-block`}>
                  {roleBadge.text}
                </span>
              </div>
            </div>
          </div>
          
          <div className="pl-2">
            <div className="flex items-center text-sm text-gray-400 mt-1">
              <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            
            {user.phone && (
              <div className="flex items-center text-sm text-gray-400 mt-1">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
