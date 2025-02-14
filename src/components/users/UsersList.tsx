
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Building2, Briefcase, CheckCircle2, AlertCircle, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserDetailsDialog } from "./UserDetailsDialog";

interface UsersListProps {
  users: any[];
  onUserClick: (user: any) => void;
}

export function UsersList({ users, onUserClick }: UsersListProps) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditClick = (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleCardClick = (user: any) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {users.map((user) => (
          <Card 
            key={user.id} 
            className="bg-spotify-darker hover:bg-spotify-accent/40 transition-all cursor-pointer transform hover:scale-[1.02] duration-200 relative group"
            onClick={() => handleCardClick(user)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => handleEditClick(e, user)}
            >
              <Edit className="h-4 w-4 text-white" />
            </Button>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-left">
                    <h3 className="text-xl font-semibold text-white">
                      {user.first_name} {user.last_name}
                    </h3>
                    <Badge 
                      variant={user.role === 'admin' ? 'destructive' : user.role === 'technician' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {user.role}
                    </Badge>
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

      <UserDetailsDialog
        user={selectedUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
