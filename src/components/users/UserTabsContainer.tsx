
import { Users as UsersIcon, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersList } from "@/components/users/UsersList";
import { UserClaimsManager } from "@/components/admin/UserClaimsManager";
import { User } from "@/types/users";

interface UserTabsContainerProps {
  users: User[];
  onUserClick: (user: User) => void;
  canAddUsers: boolean;
  usersError: Error | null;
  isSuperAdmin: boolean;
}

export function UserTabsContainer({ 
  users, 
  onUserClick, 
  canAddUsers, 
  usersError,
  isSuperAdmin 
}: UserTabsContainerProps) {
  const renderUsersContent = () => {
    if (users.length === 0) {
      return (
        <div className="text-center text-gray-400 py-8">
          No users found. {canAddUsers ? "Click \"Add User\" to create one." : ""}
          {usersError && (
            <div className="mt-2 text-yellow-400 text-sm">
              Note: There was an issue accessing the users database. You may need to configure Firebase permissions.
            </div>
          )}
        </div>
      );
    }

    return (
      <UsersList
        users={users}
        onUserClick={onUserClick}
      />
    );
  };

  if (isSuperAdmin) {
    return (
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-spotify-darker">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            Users Management
          </TabsTrigger>
          <TabsTrigger value="claims" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Claims Management
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-6">
          <Card className="p-6 bg-spotify-darker border-spotify-accent">
            <div className="flex items-center mb-4">
              <UsersIcon className="h-5 w-5 text-mywater-blue mr-2" />
              <h2 className="text-xl font-semibold text-white">System Users</h2>
            </div>
            {renderUsersContent()}
          </Card>
        </TabsContent>
        
        <TabsContent value="claims" className="space-y-6">
          <UserClaimsManager />
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <Card className="p-6 bg-spotify-darker border-spotify-accent">
      <div className="flex items-center mb-4">
        <UsersIcon className="h-5 w-5 text-mywater-blue mr-2" />
        <h2 className="text-xl font-semibold text-white">System Users</h2>
      </div>
      {renderUsersContent()}
    </Card>
  );
}
