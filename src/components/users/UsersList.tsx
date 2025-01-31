import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, Building2, Briefcase, CheckCircle2, AlertCircle } from "lucide-react";

interface UsersListProps {
  users: any[];
  onUserClick: (user: any) => void;
}

export function UsersList({ users, onUserClick }: UsersListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {users.map((user) => (
        <Card 
          key={user.id} 
          className="bg-spotify-darker hover:bg-spotify-accent/40 transition-colors cursor-pointer"
          onClick={() => onUserClick(user)}
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-white">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-sm text-gray-400">{user.role}</p>
                </div>
                {user.status === 'active' ? (
                  <CheckCircle2 className="h-5 w-5 text-spotify-green" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Phone className="h-4 w-4" />
                    {user.phone}
                  </div>
                )}
                {user.company && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Building2 className="h-4 w-4" />
                    {user.company}
                  </div>
                )}
                {user.job_title && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Briefcase className="h-4 w-4" />
                    {user.job_title}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}