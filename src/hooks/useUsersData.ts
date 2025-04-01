
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { collection, getDocs, query, where, DocumentData } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { User, UserRole } from "@/types/users";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

export function useUsersData() {
  const { toast } = useToast();
  const { user: currentUser } = useFirebaseAuth();
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("user");
  
  // Fetch current user details to get role
  const { isLoading: isRoleLoading } = useQuery({
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

  // Fetch users based on role and access permissions
  const { data: users = [], isLoading: isUsersLoading, error: usersError } = useQuery({
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
            // Add any other properties from the User type
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
    enabled: !!currentUser?.uid && !isRoleLoading,
  });

  const canAddUsers = currentUserRole === "superadmin" || currentUserRole === "admin";

  return {
    users,
    isLoading: isRoleLoading || isUsersLoading,
    error: usersError,
    currentUserRole,
    canAddUsers,
  };
}
