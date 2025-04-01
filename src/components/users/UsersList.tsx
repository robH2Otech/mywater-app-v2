
import { UserCard } from "./UserCard";
import { User } from "@/types/users";

interface UsersListProps {
  users: User[];
  onUserClick: (user: User) => void;
}

export function UsersList({ users, onUserClick }: UsersListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onClick={() => onUserClick(user)}
        />
      ))}
    </div>
  );
}
