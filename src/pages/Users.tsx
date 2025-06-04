
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
      console.log("Fetching users data...");
      try {
        const usersCollection = collection(db, "app_users_business");
        const usersQuery = query(usersCollection, orderBy("created_at", "desc"));
        const usersSnapshot = await getDocs(usersQuery);
        
        return usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
      } catch (error) {
        console.error("Users: Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

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
      
      {users.length === 0 ? (
        <div className="bg-spotify-darker border-spotify-accent p-6 rounded-lg">
          <div className="text-center text-gray-400 py-8">
            No users found. Click "Add User" to create one.
          </div>
        </div>
      ) : (
        <UsersList
          users={users}
          onUserClick={setSelectedUser}
        />
      )}

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
