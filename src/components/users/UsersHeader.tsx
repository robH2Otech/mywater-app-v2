
import { UserRole } from "@/types/users";
import { Card } from "@/components/ui/card";
import { UsersIcon, ShieldAlert, Shield } from "lucide-react";

interface UsersHeaderProps {
  currentUserRole: UserRole;
}

export function UsersHeader({ currentUserRole }: UsersHeaderProps) {
  return (
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
    </Card>
  );
}
