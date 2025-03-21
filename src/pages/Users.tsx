
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { UserDetailsDialog } from "@/components/users/UserDetailsDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { UsersList } from "@/components/users/UsersList";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

export const Users = () => {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const { data: users = [], isLoading: unitsLoading, error: unitsError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Fetching users data from Firebase...");
      try {
        // Updated to fetch from app_users_business collection
        const usersCollection = collection(db, "app_users_business");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log("Users data:", usersList);
        return usersList;
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error fetching users",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

  if (unitsError) {
    return <div>Error loading users. Please try again.</div>;
  }

  if (unitsLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage system users and permissions"
        onAddClick={() => setIsAddUserOpen(true)}
        addButtonText="Add User"
      />
      
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

      <AddUserDialog 
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
      />

      <UserDetailsDialog
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
        user={selectedUser}
        currentUserRole="superadmin" // TODO: Get this from authentication context
      />
    </div>
  );
};
