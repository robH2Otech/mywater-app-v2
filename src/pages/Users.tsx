
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { UserDetailsDialog } from "@/components/users/UserDetailsDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { UsersList } from "@/components/users/UsersList";
import { collection, getDocs, query, where, DocumentData } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { Card } from "@/components/ui/card";
import { Users as UsersIcon } from "lucide-react";
import { User, UserRole } from "@/types/users";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

export const Users = () => {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const { user: currentAuthUser } = useFirebaseAuth();
  
  // Get current user's role - in a real app, you'd fetch this from your user profile
  // For now, we'll default to showing admin UI
  const currentUserRole: UserRole = "superadmin";
  
  // Add a state to track if we're filtering by company
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);

  const canEditUsers = currentUserRole === "superadmin" || currentUserRole === "admin";
  const canAddUsers = currentUserRole === "superadmin" || currentUserRole === "admin";

  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ["users", companyFilter],
    queryFn: async () => {
      console.log("Fetching users data from Firebase...");
      try {
        // Create a base query for the collection
        const usersCollection = collection(db, "app_users_business");
        
        // If we have a company filter and the user isn't an admin/superadmin, apply it
        let usersQuery;
        if (companyFilter && currentUserRole !== "superadmin" && currentUserRole !== "admin") {
          usersQuery = query(usersCollection, where("company", "==", companyFilter));
        } else {
          usersQuery = usersCollection;
        }
        
        const usersSnapshot = await getDocs(usersQuery);
        const usersList = usersSnapshot.docs.map(doc => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            role: data.role || "user",
            status: data.status || "active",
            phone: data.phone || "",
            company: data.company || "",
            job_title: data.job_title || "",
            created_at: data.created_at,
            updated_at: data.updated_at
          } as User;
        });
        
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

  if (usersError) {
    return (
      <div className="space-y-6 animate-fadeIn p-2 md:p-0">
        <PageHeader
          title="Users"
          description="Manage system users and permissions"
          onAddClick={() => setIsAddUserOpen(true)}
          addButtonText="Add User"
          showAddButton={canAddUsers}
        />
        <div className="bg-spotify-darker border-spotify-accent p-6 rounded-lg">
          <div className="text-red-400">Error loading users. Please try again.</div>
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
      
      <Card className="p-6 bg-spotify-darker border-spotify-accent">
        <div className="flex items-center mb-4">
          <UsersIcon className="h-5 w-5 text-mywater-blue mr-2" />
          <h2 className="text-xl font-semibold text-white">System Users</h2>
        </div>
        
        {users.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No users found. {canAddUsers ? "Click \"Add User\" to create one." : "Contact your administrator for access."}
          </div>
        ) : (
          <UsersList
            users={users}
            onUserClick={setSelectedUser}
          />
        )}
      </Card>

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
