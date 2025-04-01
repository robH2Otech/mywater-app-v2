
import { UserRole } from "@/types/users";
import { Card } from "@/components/ui/card";

interface UsersHeaderProps {
  currentUserRole: UserRole;
}

export function UsersHeader({ currentUserRole }: UsersHeaderProps) {
  return (
    <Card className="p-6 bg-spotify-darker border-spotify-accent">
      <h2 className="text-2xl font-bold text-white">Users</h2>
      <p className="text-gray-400">Manage system users and permissions</p>
    </Card>
  );
}
