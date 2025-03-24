
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

interface UserMigrationHandlerProps {
  children: React.ReactNode;
}

export function UserMigrationHandler({ children }: UserMigrationHandlerProps) {
  const { toast } = useToast();
  const [migratingUsers, setMigratingUsers] = useState(false);

  // Check if business users have been migrated
  useEffect(() => {
    const checkBusinessUsers = async () => {
      try {
        // Check if the collection exists and has documents
        const businessUsersSnapshot = await getDocs(collection(db, "app_users_business"));
        
        if (businessUsersSnapshot.empty) {
          // Get all existing users
          const usersSnapshot = await getDocs(collection(db, "app_users"));
          
          if (!usersSnapshot.empty) {
            setMigratingUsers(true);
            
            // Migrate all users to business collection
            for (const doc of usersSnapshot.docs) {
              const userData = doc.data();
              await addDoc(collection(db, "app_users_business"), {
                ...userData,
                migrated_at: new Date().toISOString(),
              });
            }
            
            toast({
              title: "Users Migrated",
              description: "All users have been migrated to business accounts.",
            });
          }
          
          setMigratingUsers(false);
        }
      } catch (error) {
        console.error("Error checking business users:", error);
        setMigratingUsers(false);
      }
    };
    
    checkBusinessUsers();
  }, [toast]);

  if (migratingUsers) {
    return (
      <div className="min-h-screen bg-spotify-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-spotify-darker p-8 rounded-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              Migrating Users
            </h2>
            <p className="mt-2 text-gray-400">
              Please wait while we migrate user accounts...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
