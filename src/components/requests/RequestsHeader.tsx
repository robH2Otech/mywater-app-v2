
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, Shield } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { logAuditEvent } from "@/utils/auth/securityUtils";

interface RequestsHeaderProps {
  onRefresh: () => void;
  onCreateRequest: () => void;
  isReadOnly?: boolean;
}

export function RequestsHeader({ onRefresh, onCreateRequest, isReadOnly }: RequestsHeaderProps) {
  const { secureRoleVerified } = usePermissions();
  
  const handleCreateClick = () => {
    logAuditEvent('ui_interaction', {
      type: 'create_request_button'
    });
    onCreateRequest();
  };
  
  const handleRefreshClick = () => {
    logAuditEvent('ui_interaction', {
      type: 'refresh_requests'
    });
    onRefresh();
  };
  
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Client Support Requests</h1>
        <p className="text-sm md:text-base text-gray-400">Manage and respond to client support requests</p>
      </div>
      <div className="flex gap-2 items-center">
        {!secureRoleVerified && (
          <div className="px-3 py-1 bg-red-900/30 border border-red-700/50 text-red-400 text-xs rounded-md flex items-center">
            <Shield className="h-3 w-3 mr-1" />
            Security verification failed
          </div>
        )}
        <Button 
          onClick={handleRefreshClick}
          variant="outline" 
          className="w-full md:w-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        {!isReadOnly && (
          <Button 
            className="bg-mywater-blue hover:bg-mywater-blue/90 w-full md:w-auto"
            onClick={handleCreateClick}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Request
          </Button>
        )}
      </div>
    </div>
  );
}
