
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
import { Users as UsersIcon, Shield, AlertCircle } from "lucide-react";
import { User, UserRole, UserStatus } from "@/types/users";
import { usePermissions } from "@/hooks/usePermissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

const Users = () => {
  const { toast } = useToast();
  const { hasPermission, userRole, company, isSuperAdmin } = usePermissions();
  const { firebaseUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Fetching users data from Firebase...");
      
      // Create properly typed mock data for testing
      const mockUsers: User[] = [
        {
          id: firebaseUser?.uid || "1",
          first_name: firebaseUser?.displayName?.split(' ')[0] || firebaseUser?.email?.split('@')[0] || "Admin",
          last_name: firebaseUser?.displayName?.split(' ')[1] || "User",
          email: firebaseUser?.email || "admin@xwater.com",
          company: "xwater",
          role: "superadmin" as UserRole,
          status: "active" as UserStatus,
          job_title: "System Administrator"
        },
        {
          id: "2",
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@xwater.com",
          company: "xwater",
          role: "admin" as UserRole,
          status: "active" as UserStatus,
          job_title: "Water Engineer"
        },
        {
          id: "3",
          first_name: "Jane",
          last_name: "Smith",
          email: "jane.smith@xwater.com",
          company: "xwater",
          role: "technician" as UserRole,
          status: "active" as UserStatus,
          job_title: "Field Technician"
        }
      ];

      try {
        const usersCollection = collection(db, "app_users_business");
        const usersSnapshot = await getDocs(usersCollection);
        
        if (usersSnapshot.empty) {
          console.log("No users found in Firebase, using mock data");
          return mockUsers;
        }
        
        const usersList = usersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            company: data.company || "",
            role: (data.role as UserRole) || "user",
            status: (data.status as UserStatus) || "active",
            job_title: data.job_title || "",
            phone: data.phone || "",
            created_at: data.created_at || "",
            updated_at: data.updated_at || ""
          } as User;
        });
        
        console.log("Users data:", usersList);
        return usersList.length > 0 ? usersList : mockUsers;
      } catch (firestoreError) {
        console.log("Firebase error, using mock data:", firestoreError);
        return mockUsers;
      }
    },
  });

  // Check if the current user can add new users
  const canAddUsers = hasPermission("admin");

  if (usersError) {
    return (
      <div className="space-y-6 animate-fadeIn p-2 md:p-0">
        <PageHeader
          title="Users"
          description="Manage system users and permissions"
          onAddClick={canAddUsers ? () => setIsAddUserOpen(true) : undefined}
          addButtonText={canAddUsers ? "Add User" : undefined}
        />
        <Card className="p-6 bg-spotify-darker border-spotify-accent">
          <div className="flex items-center space-x-3 text-yellow-400">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Connection Issue</p>
              <p className="text-sm text-gray-400">Using cached user data. Some features may be limited.</p>
            </div>
          </div>
        </Card>
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
