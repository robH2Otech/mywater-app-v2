
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { UserDetailsDialog } from "@/components/users/UserDetailsDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { UsersList } from "@/components/users/UsersList";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { Card } from "@/components/ui/card";
import { Users as UsersIcon, ShieldAlert, Shield } from "lucide-react";
import { User, UserRole } from "@/types/users";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

export const Users = () => {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const { user: currentUser } = useFirebaseAuth();
  
  // Determine current user role - default to "user" if we can't determine
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("user");
  
  // Fetch current user details to get role
  useQuery({
    queryKey: ["currentUserRole", currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return null;
      
      try {
        const userQuery = query(
          collection(db, "app_users_business"), 
          where("uid", "==", currentUser.uid)
        );
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setCurrentUserRole(userData.role as UserRole);
          return userData.role;
        }
        return null;
      } catch (error) {
        console.error("Error fetching current user role:", error);
        return null;
      }
    },
    enabled: !!currentUser?.uid,
  });

  const { data: users = [], isLoading: unitsLoading, error: unitsError } = useQuery({
    queryKey: ["users", currentUserRole, currentUser?.uid],
    queryFn: async () => {
      console.log("Fetching users data from Firebase...");
      try {
        let usersQuery;
        
        // If user is superadmin or admin, show all users
        if (currentUserRole === "superadmin" || currentUserRole === "admin") {
          usersQuery = collection(db, "app_users_business");
        } 
        // If user is technician or regular user, show only users from the same company
        else {
          // First get the current user's company
          const currentUserQuery = query(
            collection(db, "app_users_business"),
            where("uid", "==", currentUser?.uid)
          );
          const currentUserSnapshot = await getDocs(currentUserQuery);
          
          if (currentUserSnapshot.empty) {
            throw new Error("Current user not found");
          }
          
          const currentUserData = currentUserSnapshot.docs[0].data();
          const userCompany = currentUserData.company;
          
          if (!userCompany) {
            throw new Error("User company information not available");
          }
          
          // Then query users with the same company
          usersQuery = query(
            collection(db, "app_users_business"),
            where("company", "==", userCompany)
          );
        }
        
        const usersSnapshot = await getDocs(usersQuery);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          first_name: doc.data().first_name || "",
          last_name: doc.data().last_name || "",
          email: doc.data().email || "",
          role: doc.data().role || "user",
          status: doc.data().status || "active",
          ...doc.data()
        })) as User[];
        
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
    enabled: !!currentUser?.uid,
  });

  const canAddUsers = currentUserRole === "superadmin" || currentUserRole === "admin";

  if (unitsError) {
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

  if (unitsLoading) {
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
          {currentUserRole === "superadmin" ? (
            <ShieldAlert className="h-5 w-5 text-mywater-blue mr-2" />
          ) : currentUserRole === "admin" ? (
            <Shield className="h-5 w-5 text-mywater-blue mr-2" />
          ) : (
            <UsersIcon className="h-5 w-5 text-mywater-blue mr-2" />
          )}
          
          <h2 className="text-xl font-semibold text-white">
            {currentUserRole === "superadmin" || currentUserRole === "admin" 
              ? "All System Users" 
              : "Company Users"}
          </h2>
          
          {currentUserRole && (
            <span className="ml-auto px-3 py-1 text-xs font-medium rounded-full bg-spotify-accent text-white">
              {currentUserRole === "superadmin" 
                ? "Super Admin View" 
                : currentUserRole === "admin" 
                  ? "Admin View" 
                  : "Limited View"}
            </span>
          )}
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
