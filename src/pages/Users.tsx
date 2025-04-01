
import { useState } from "react";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { UserDetailsDialog } from "@/components/users/UserDetailsDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { User } from "@/types/users";
import { useUsersData } from "@/hooks/useUsersData";
import { UsersHeader } from "@/components/users/UsersHeader";
import { UsersContent } from "@/components/users/UsersContent";
import { UsersError } from "@/components/users/UsersError";

export const Users = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  
  const { 
    users, 
    isLoading, 
    error, 
    currentUserRole, 
    canAddUsers 
  } = useUsersData();

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn p-2 md:p-0">
        <PageHeader
          title="Users"
          description="Manage system users and permissions"
          onAddClick={() => setIsAddUserOpen(true)}
          addButtonText="Add User"
          showAddButton={canAddUsers}
        />
        <UsersError />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn p-2 md:p-0">
        <PageHeader
          title="Users"
          description="Manage system users and permissions"
          onAddClick={() => setIsAddUserOpen(true)}
          addButtonText="Add User"
          showAddButton={canAddUsers}
        />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn p-2 md:p-0">
      <PageHeader
        title="Users"
        description="Manage system users and permissions"
        onAddClick={() => setIsAddUserOpen(true)}
        addButtonText="Add User"
        showAddButton={canAddUsers}
      />
      
      <UsersHeader currentUserRole={currentUserRole} />
      
      <UsersContent 
        users={users} 
        currentUserRole={currentUserRole} 
        onUserClick={setSelectedUser} 
      />

      {canAddUsers && (
        <AddUserDialog 
          open={isAddUserOpen}
          onOpenChange={setIsAddUserOpen}
        />
      )}

      <UserDetailsDialog
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
        user={selectedUser}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}
