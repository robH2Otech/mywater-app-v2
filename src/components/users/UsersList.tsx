
import { UserCard } from "./UserCard";
import { User } from "@/types/users";
import { useIsMobile } from "@/hooks/use-mobile";

interface UsersListProps {
  users: User[];
  onUserClick: (user: User) => void;
}

export function UsersList({ users, onUserClick }: UsersListProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2 xl:grid-cols-3'} gap-4`}>
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
