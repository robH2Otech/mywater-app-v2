
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
      console.log("🔄 Fetching real users from Firebase...");
      
      try {
        const usersCollection = collection(db, "app_users_business");
        const usersSnapshot = await getDocs(usersCollection);
        
        if (usersSnapshot.empty) {
          console.log("❌ No users found in Firebase app_users_business collection");
          return [];
        }
        
        const usersList = usersSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("📋 Processing user:", doc.id, data);
          
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
        
        console.log("✅ Successfully fetched", usersList.length, "real users from Firebase");
        console.log("👥 Users:", usersList.map(u => ({ email: u.email, role: u.role })));
        
        return usersList;
      } catch (error) {
        console.error("❌ Error fetching users from Firebase:", error);
        throw new Error(`Failed to fetch users: ${error}`);
      }
    },
    retry: 2,
    retryDelay: 1000
  });

  // Check if the current user can add new users
  const canAddUsers = hasPermission("admin");

  if (usersError) {
    console.error("💥 Users query error:", usersError);
    return (
      <div className="space-y-6 animate-fadeIn p-2 md:p-0">
        <PageHeader
          title="Users"
          description="Manage system users and permissions"
          onAddClick={canAddUsers ? () => setIsAddUserOpen(true) : undefined}
          addButtonText={canAddUsers ? "Add User" : undefined}
        />
        <Card className="p-6 bg-spotify-darker border-spotify-accent">
          <div className="flex items-center space-x-3 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Failed to Load Users</p>
              <p className="text-sm text-gray-400">
                Could not connect to Firebase: {usersError.message}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Please check your Firebase configuration and permissions.
              </p>
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
              Users Management ({users.length})
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
                <h2 className="text-xl font-semibold text-white">
                  Firebase Users ({users.length} found)
                </h2>
              </div>
              
              {users.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>No users found in Firebase collection.</p>
                  <p className="text-sm mt-2">Check app_users_business collection in Firestore.</p>
                  {canAddUsers && <p className="text-sm mt-2">Click "Add User" to create one.</p>}
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
            <h2 className="text-xl font-semibold text-white">
              System Users ({users.length} found)
            </h2>
          </div>
          
          {users.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>No users found in Firebase collection.</p>
              <p className="text-sm mt-2">Check app_users_business collection in Firestore.</p>
              {canAddUsers && <p className="text-sm mt-2">Click "Add User" to create one.</p>}
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
