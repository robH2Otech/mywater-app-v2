
import { SupportRequest } from "@/types/supportRequests";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { RequestsTabTrigger } from "@/components/requests/RequestsTabTrigger";
import { RequestCard } from "@/components/requests/RequestCard";
import { NoRequestsFound } from "@/components/requests/NoRequestsFound";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

interface RequestsListProps {
  requests: SupportRequest[];
  isLoading: boolean;
  error: string | null;
  activeFilter: string;
  onFilterChange: (value: string) => void;
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
  return (
    <>
      <Tabs 
        defaultValue="new" 
        value={activeFilter}
        onValueChange={onFilterChange}
        className="w-full mb-4"
      >
        <TabsList className="bg-spotify-dark mb-4">
          <RequestsTabTrigger value="new" label="New" />
          <RequestsTabTrigger value="in_progress" label="In Progress" />
          <RequestsTabTrigger value="resolved" label="Resolved" />
          <RequestsTabTrigger value="all" label="All Requests" />
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <NoRequestsFound 
          filterType={activeFilter} 
          error={true} 
          errorMessage={error} 
          retryFunction={onRetry}
        />
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <RequestCard 
              key={request.id} 
              request={request} 
              onAction={onAction} 
            />
          ))}
        </div>
      ) : (
        <NoRequestsFound filterType={activeFilter} />
      )}
    </>
  );
}
