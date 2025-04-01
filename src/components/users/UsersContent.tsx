
import { User, UserRole } from "@/types/users";
import { Card } from "@/components/ui/card";
import { UsersList } from "@/components/users/UsersList";

interface UsersContentProps {
  users: User[];
  currentUserRole: UserRole;
  onUserClick: (user: User) => void;
}

export function UsersContent({ users, currentUserRole, onUserClick }: UsersContentProps) {
  return (
    <Card className="p-6 bg-spotify-darker border-spotify-accent">
      {users.length === 0 ? (
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
