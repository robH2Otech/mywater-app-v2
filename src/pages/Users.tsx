
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { UserDetailsDialog } from "@/components/users/UserDetailsDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { UsersList } from "@/components/users/UsersList";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { Card } from "@/components/ui/card";
import { Users as UsersIcon } from "lucide-react";
import { User } from "@/types/users";

const Users = () => {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Fetching users from app_users_business collection...");
      
      const usersCollection = collection(db, "app_users_business");
      const usersQuery = query(usersCollection, orderBy("first_name"));
      const usersSnapshot = await getDocs(usersQuery);
      
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      console.log("Users fetched successfully:", usersList.length, "users");
      return usersList;
    },
  });

  if (error) {
    console.error("Error fetching users:", error);
    toast({
      title: "Error fetching users",
      description: error instanceof Error ? error.message : "Failed to fetch users",
      variant: "destructive",
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn p-2 md:p-0">
        <PageHeader
          title="Users"
          description="Manage system users and permissions"
          onAddClick={() => setIsAddUserOpen(true)}
          addButtonText="Add User"
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
      />
      
      <Card className="p-6 bg-spotify-darker border-spotify-accent">
        <div className="flex items-center mb-4">
          <UsersIcon className="h-5 w-5 text-mywater-blue mr-2" />
          <h2 className="text-xl font-semibold text-white">System Users</h2>
        </div>
        
        {users.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No users found. Click "Add User" to create one.
          </div>
        ) : (
          <UsersList
            users={users}
            onUserClick={setSelectedUser}
          />
        )}
      </Card>

      <AddUserDialog 
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
      />

      <UserDetailsDialog
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
        user={selectedUser}
      />
    </div>
  );
};

export default Users;
