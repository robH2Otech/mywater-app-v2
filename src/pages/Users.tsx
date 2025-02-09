
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { UserDetailsDialog } from "@/components/users/UserDetailsDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { UsersList } from "@/components/users/UsersList";
import { Layout } from "@/components/layout/Layout";

export const Users = () => {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Fetching users data...");
      const { data, error } = await supabase
        .from("app_users")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error fetching users",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      if (!data) {
        console.log("No users found");
        return [];
      }
      
      console.log("Users data:", data);
      return data;
    },
  });

  if (error) {
    return <div>Error loading users. Please try again.</div>;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Layout>
      <div className="space-y-4">
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
        />
      </div>
    </Layout>
  );
};
