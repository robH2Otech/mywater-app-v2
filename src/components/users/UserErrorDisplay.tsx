
import { PageHeader } from "@/components/shared/PageHeader";

interface UserErrorDisplayProps {
  errorMessage: string;
  isPermissionError: boolean;
  userRole: string | null;
  canAddUsers: boolean;
  onAddUserClick: () => void;
}

export function UserErrorDisplay({ 
  errorMessage, 
  isPermissionError, 
  userRole, 
  canAddUsers, 
  onAddUserClick 
}: UserErrorDisplayProps) {
  return (
    <div className="space-y-6 animate-fadeIn p-2 md:p-0">
      <PageHeader
        title="Users"
        description="Manage system users and permissions"
        onAddClick={canAddUsers ? onAddUserClick : undefined}
        addButtonText={canAddUsers ? "Add User" : undefined}
      />
      <div className="bg-spotify-darker border-spotify-accent p-6 rounded-lg">
        <div className="text-red-400 mb-2">Error loading users</div>
        <div className="text-gray-300 mb-4">
          {isPermissionError && userRole === "superadmin" 
            ? "Superadmin detected but Firebase permission error occurred. This may be a configuration issue."
            : errorMessage
          }
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
