
import { UserCard } from "./UserCard";
import { User } from "@/types/users";

interface UsersListProps {
  users: User[];
  onUserClick: (user: User) => void;
}

export function UsersList({ users, onUserClick }: UsersListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
