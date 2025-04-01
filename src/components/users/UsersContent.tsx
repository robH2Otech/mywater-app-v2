
import { User, UserRole } from "@/types/users";
import { Card } from "@/components/ui/card";
import { UsersList } from "@/components/users/UsersList";
import { Users as UsersIcon } from "lucide-react";

interface UsersContentProps {
  users: User[];
  currentUserRole: UserRole;
  onUserClick: (user: User) => void;
}

export function UsersContent({ users, currentUserRole, onUserClick }: UsersContentProps) {
  const hasUsers = Array.isArray(users) && users.length > 0;
  
  return (
    <Card className="p-6 bg-spotify-darker border-spotify-accent">
      <div className="flex items-center mb-4">
        <UsersIcon className="h-5 w-5 text-mywater-blue mr-2" />
        <h2 className="text-xl font-medium text-white">System Users</h2>
      </div>
      
      {!hasUsers ? (
        <div className="text-center text-gray-400 py-8">
          No users found. {currentUserRole === "superadmin" || currentUserRole === "admin" 
            ? "Click \"Add User\" to create one." 
            : ""}
        </div>
      ) : (
        <UsersList
          users={users}
          onUserClick={onUserClick}
        />
      )}
    </Card>
  );
}
