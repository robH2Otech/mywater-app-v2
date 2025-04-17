
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RequestCard } from "./RequestCard";
import { NoRequestsFound } from "./NoRequestsFound";
import { RequestsTabTrigger } from "./RequestsTabTrigger";
import { SupportRequest } from "@/types/supportRequests";
import { RefreshCcw, AlertTriangle } from "lucide-react";

interface RequestsListProps {
  requests: SupportRequest[] | null | undefined;
  isLoading: boolean;
  error: string | null;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onRetry: () => void;
  onAction: (action: 'status' | 'email' | 'comment', request: SupportRequest, newStatus?: "new" | "in_progress" | "resolved") => void;
}

export function RequestsList({
  requests,
  isLoading,
  error,
  activeFilter,
  onFilterChange,
  onRetry,
  onAction
}: RequestsListProps) {
  const [isEmailSending, setIsEmailSending] = useState<string | null>(null);
  
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
      setIsEmailSending(request.id);
      await onAction('email', request);
    } finally {
      setIsEmailSending(null);
    }
  };

  return (
    <Tabs
      defaultValue={activeFilter}
      value={activeFilter}
      onValueChange={onFilterChange}
      className="w-full"
    >
      <TabsList className="grid grid-cols-4 mb-4">
        <RequestsTabTrigger value="all" label="All Requests" />
        <RequestsTabTrigger value="new" label="New" />
        <RequestsTabTrigger value="in_progress" label="In Progress" />
        <RequestsTabTrigger value="resolved" label="Resolved" />
      </TabsList>
      
      <TabsContent value="all" className="space-y-4">
        {requests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            onStatusChange={(status) => onAction('status', request, status)}
            onComment={() => onAction('comment', request)}
            onEmail={() => handleEmailAction(request)}
            isEmailSending={isEmailSending === request.id}
          />
        ))}
      </TabsContent>
      
      <TabsContent value="new" className="space-y-4">
        {requests
          .filter((request) => request.status === "new")
          .map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onStatusChange={(status) => onAction('status', request, status)}
              onComment={() => onAction('comment', request)}
              onEmail={() => handleEmailAction(request)}
              isEmailSending={isEmailSending === request.id}
            />
          ))}
      </TabsContent>
      
      <TabsContent value="in_progress" className="space-y-4">
        {requests
          .filter((request) => request.status === "in_progress")
          .map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onStatusChange={(status) => onAction('status', request, status)}
              onComment={() => onAction('comment', request)}
              onEmail={() => handleEmailAction(request)}
              isEmailSending={isEmailSending === request.id}
            />
          ))}
      </TabsContent>
      
      <TabsContent value="resolved" className="space-y-4">
        {requests
          .filter((request) => request.status === "resolved")
          .map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onStatusChange={(status) => onAction('status', request, status)}
              onComment={() => onAction('comment', request)}
              onEmail={() => handleEmailAction(request)}
              isEmailSending={isEmailSending === request.id}
            />
          ))}
      </TabsContent>
    </Tabs>
  );
}
