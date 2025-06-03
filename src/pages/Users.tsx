import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { UserDetailsDialog } from "@/components/users/UserDetailsDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { UsersList } from "@/components/users/UsersList";
import { UserClaimsManager } from "@/components/admin/UserClaimsManager";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { Card } from "@/components/ui/card";
import { Users as UsersIcon, Shield } from "lucide-react";
import { User, UserRole } from "@/types/users";
import { usePermissions } from "@/hooks/usePermissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Users = () => {
  const { toast } = useToast();
  const { hasPermission, userRole: originalUserRole, company, isSuperAdmin } = usePermissions();
  
  // Explicitly type userRole to ensure superadmin is included with force cast
  const userRole = originalUserRole as UserRole | null;
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Users: Fetching users data from Firebase...");
      console.log("Users: Current user role:", userRole);
      console.log("Users: Can manage users:", hasPermission("admin"));
      
      try {
        const usersCollection = collection(db, "app_users_business");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          first_name: doc.data().first_name || "",
          last_name: doc.data().last_name || "",
          email: doc.data().email || "",
          company: doc.data().company || "",
          role: doc.data().role || "user",
          status: doc.data().status || "active",
          ...doc.data()
        })) as User[];
        
        console.log("Users: Users data:", usersList);
        return usersList;
      } catch (error) {
        console.error("Users: Error fetching users:", error);
        
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Users: Detailed error:", errorMessage);
        
        // For superadmin, provide more helpful error information but still show the interface
        if ((userRole as UserRole) === "superadmin") {
          console.log("Users: Superadmin detected, providing fallback");
          toast({
            title: "Warning: Users data access issue",
            description: `Database access issue detected. Error: ${errorMessage}`,
            variant: "destructive",
          });
          
          // Return empty array to allow interface to show
          return [];
        } else {
          toast({
            title: "Error fetching users",
            description: errorMessage,
            variant: "destructive",
          });
          throw error;
        }
      }
    },
    enabled: !!userRole, // Simplified enablement condition
    retry: (failureCount, error) => {
      // For superadmin, retry more aggressively
      if ((userRole as UserRole) === "superadmin" && failureCount < 2) {
        return true;
      }
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Check if the current user can add new users
  const canAddUsers = hasPermission("admin");

  // Enhanced error display
  if (usersError && (userRole as UserRole) !== "superadmin") {
    const errorMessage = usersError instanceof Error ? usersError.message : "Unknown error";
    const isPermissionError = errorMessage.includes("permission") || errorMessage.includes("insufficient");
    
    return (
      <div className="space-y-6 animate-fadeIn p-2 md:p-0">
        <PageHeader
          title="Users"
          description="Manage system users and permissions"
          onAddClick={canAddUsers ? () => setIsAddUserOpen(true) : undefined}
          addButtonText={canAddUsers ? "Add User" : undefined}
        />
        <div className="bg-spotify-darker border-spotify-accent p-6 rounded-lg">
          <div className="text-red-400 mb-2">Error loading users</div>
          <div className="text-gray-300 mb-4">
            {isPermissionError && userRole === "superadmin" 
              ? "Superadmin detected but Firebase permission error occurred. This may be a configuration issue."
              : errorMessage
            }
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
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
      
      {isSuperAdmin() ? (
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
              
              {users.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No users found. {canAddUsers ? "Click \"Add User\" to create one." : ""}
                  {usersError && (
                    <div className="mt-2 text-yellow-400 text-sm">
                      Note: There was an issue accessing the users database. You may need to configure Firebase permissions.
                    </div>
                  )}
                </div>
              ) : (
                <UsersList
                  users={users}
                  onUserClick={setSelectedUser}
                />
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="claims" className="space-y-6">
            <UserClaimsManager />
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="p-6 bg-spotify-darker border-spotify-accent">
          <div className="flex items-center mb-4">
            <UsersIcon className="h-5 w-5 text-mywater-blue mr-2" />
            <h2 className="text-xl font-semibold text-white">System Users</h2>
          </div>
          
          {users.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No users found. {canAddUsers ? "Click \"Add User\" to create one." : ""}
            </div>
          ) : (
            <UsersList
              users={users}
              onUserClick={setSelectedUser}
            />
          )}
        </Card>
      )}

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
