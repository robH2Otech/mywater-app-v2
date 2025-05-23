
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RequestCard } from "./RequestCard";
import { NoRequestsFound } from "./NoRequestsFound";
import { RequestsTabTrigger } from "./RequestsTabTrigger";
import { SupportRequest } from "@/types/supportRequests";
import { RefreshCcw, AlertTriangle, Shield } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { logAuditEvent } from "@/utils/auth/securityUtils";

interface RequestsListProps {
  requests: SupportRequest[] | null | undefined;
  isLoading: boolean;
  error: string | null;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onRetry: () => void;
  onAction: (action: 'status' | 'email' | 'comment', request: SupportRequest, newStatus?: "new" | "in_progress" | "resolved") => void;
  isReadOnly?: boolean;
}

export function RequestsList({
  requests,
  isLoading,
  error,
  activeFilter,
  onFilterChange,
  onRetry,
  onAction,
  isReadOnly
}: RequestsListProps) {
  const [isEmailSending, setIsEmailSending] = useState<string | null>(null);
  const { canViewData, company, userRole, secureRoleVerified } = usePermissions();
  
  // Security check - verify that user has valid role claims
  if (!secureRoleVerified) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-fadeIn space-y-4">
        <Shield className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-medium">Security Verification Failed</h3>
        <p className="text-sm text-gray-400">Your role permissions could not be verified securely.</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="destructive" 
          className="mt-2"
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Authentication
        </Button>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-fadeIn space-y-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-medium">Failed to load requests</h3>
        <p className="text-sm text-gray-400">{error}</p>
        <Button 
          onClick={onRetry} 
          variant="secondary" 
          className="mt-2"
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 h-32"></div>
        ))}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return <NoRequestsFound filterType={activeFilter} />;
  }

  const handleEmailAction = async (request: SupportRequest) => {
    try {
      // Security check - verify user can access this company's data
      if (request.company && !canViewData(request.company || null, 'requests')) {
        logAuditEvent('security_violation', {
          type: 'unauthorized_request_access',
          action: 'email',
          requestId: request.id,
          requestCompany: request.company,
          userCompany: company
        }, 'warning');
        
        console.error("Security violation: Attempted to access request from different company");
        return;
      }
      
      setIsEmailSending(request.id);
      await onAction('email', request);
    } finally {
      setIsEmailSending(null);
    }
  };
  
  // Filter requests based on company access if needed
  const filteredRequests = requests.filter(request => {
    // If the request has a company field, check if user can access it
    if (request.company) {
      return canViewData(request.company, 'requests');
    }
    return true;
  });
  
  // Log data access for audit purposes
  if (filteredRequests.length > 0) {
    logAuditEvent('data_access', {
      type: 'requests_list',
      filter: activeFilter,
      count: filteredRequests.length,
      userRole,
      company
    });
  }

  return (
    <Tabs
      defaultValue={activeFilter}
      value={activeFilter}
      onValueChange={(value) => {
        onFilterChange(value);
        // Log tab change for audit
        logAuditEvent('ui_interaction', {
          type: 'filter_change',
          from: activeFilter,
          to: value
        });
      }}
      className="w-full"
    >
      <TabsList className="grid grid-cols-4 mb-4">
        <RequestsTabTrigger value="all" label="All Requests" />
        <RequestsTabTrigger value="new" label="New" />
        <RequestsTabTrigger value="in_progress" label="In Progress" />
        <RequestsTabTrigger value="resolved" label="Resolved" />
      </TabsList>
      
      <TabsContent value="all" className="space-y-4">
        {filteredRequests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            onStatusChange={(status) => onAction('status', request, status)}
            onComment={() => onAction('comment', request)}
            onEmail={() => handleEmailAction(request)}
            isEmailSending={isEmailSending === request.id}
            isReadOnly={isReadOnly}
          />
        ))}
      </TabsContent>
      
      <TabsContent value="new" className="space-y-4">
        {filteredRequests
          .filter((request) => request.status === "new")
          .map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onStatusChange={(status) => onAction('status', request, status)}
              onComment={() => onAction('comment', request)}
              onEmail={() => handleEmailAction(request)}
              isEmailSending={isEmailSending === request.id}
              isReadOnly={isReadOnly}
            />
          ))}
      </TabsContent>
      
      <TabsContent value="in_progress" className="space-y-4">
        {filteredRequests
          .filter((request) => request.status === "in_progress")
          .map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onStatusChange={(status) => onAction('status', request, status)}
              onComment={() => onAction('comment', request)}
              onEmail={() => handleEmailAction(request)}
              isEmailSending={isEmailSending === request.id}
              isReadOnly={isReadOnly}
            />
          ))}
      </TabsContent>
      
      <TabsContent value="resolved" className="space-y-4">
        {filteredRequests
          .filter((request) => request.status === "resolved")
          .map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onStatusChange={(status) => onAction('status', request, status)}
              onComment={() => onAction('comment', request)}
              onEmail={() => handleEmailAction(request)}
              isEmailSending={isEmailSending === request.id}
              isReadOnly={isReadOnly}
            />
          ))}
      </TabsContent>
    </Tabs>
  );
}
