
import { useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { UserDetailsDialog } from "@/components/users/UserDetailsDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { UserErrorDisplay } from "@/components/users/UserErrorDisplay";
import { UserTabsContainer } from "@/components/users/UserTabsContainer";
import { User, UserRole } from "@/types/users";
import { useUsersData } from "@/hooks/users/useUsersData";

const Users = () => {
  const { hasPermission, userRole: originalUserRole, isSuperAdmin } = usePermissions();
  
  // Explicitly type userRole to ensure superadmin is included with force cast
  const userRole = originalUserRole as UserRole | null;
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const { data: users = [], isLoading: usersLoading, error: usersError } = useUsersData(userRole);

  // Check if the current user can add new users
  const canAddUsers = hasPermission("admin");

  // Enhanced error display
  if (usersError && (userRole as UserRole) !== "superadmin") {
    const errorMessage = usersError instanceof Error ? usersError.message : "Unknown error";
    const isPermissionError = errorMessage.includes("permission") || errorMessage.includes("insufficient");
    
    return (
      <UserErrorDisplay
        errorMessage={errorMessage}
        isPermissionError={isPermissionError}
        userRole={userRole}
        canAddUsers={canAddUsers}
        onAddUserClick={() => setIsAddUserOpen(true)}
      />
    );
  }

  if (usersLoading) {
    return (
      <div className="space-y-6 animate-fadeIn p-2 md:p-0">
        <PageHeader
          title="Users"
          description="Manage system users and permissions"
          onAddClick={canAddUsers ? () => setIsAddUserOpen(true) : undefined}
          addButtonText={canAddUsers ? "Add User" : undefined}
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
        onAddClick={canAddUsers ? () => setIsAddUserOpen(true) : undefined}
        addButtonText={canAddUsers ? "Add User" : undefined}
      />
      
      <UserTabsContainer
        users={users}
        onUserClick={setSelectedUser}
        canAddUsers={canAddUsers}
        usersError={usersError}
        isSuperAdmin={isSuperAdmin()}
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
      />
    </div>
  );
};

export default Users;
