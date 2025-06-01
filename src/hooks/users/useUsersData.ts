
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { User, UserRole } from "@/types/users";

export function useUsersData(userRole: UserRole | null) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Users: Fetching users data from Firebase...");
      console.log("Users: Current user role:", userRole);
      
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
    enabled: !!userRole,
    retry: (failureCount, error) => {
      // For superadmin, retry more aggressively
      if ((userRole as UserRole) === "superadmin" && failureCount < 2) {
        return true;
      }
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
