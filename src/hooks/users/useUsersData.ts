
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
        
        console.log("Users: Users data fetched successfully:", usersList.length, "users");
        return usersList;
      } catch (error) {
        console.error("Users: Error fetching users:", error);
        
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Users: Detailed error:", errorMessage);
        
        // More helpful error handling
        if (errorMessage.includes("permission") || errorMessage.includes("Missing or insufficient permissions")) {
          toast({
            title: "Authentication Issue",
            description: "Please ensure you are logged in and have proper permissions. Try refreshing the page.",
            variant: "destructive",
          });
          
          // Return empty array to prevent complete failure
          return [];
        }
        
        toast({
          title: "Error fetching users",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Return empty array to prevent complete failure
        return [];
      }
    },
    enabled: true, // Always enable, don't wait for userRole
    retry: (failureCount, error) => {
      console.log("Users: Retry attempt:", failureCount, "Error:", error);
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}
