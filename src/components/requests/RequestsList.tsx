
import { SupportRequest } from "@/types/supportRequests";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { RequestsTabTrigger } from "@/components/requests/RequestsTabTrigger";
import { RequestCard } from "@/components/requests/RequestCard";
import { NoRequestsFound } from "@/components/requests/NoRequestsFound";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
  // Debug info
  console.log(`RequestsList: activeFilter=${activeFilter}, isLoading=${isLoading}, error=${error}, requests.length=${requests?.length || 0}`);
  
  return (
    <>
      <Tabs 
        defaultValue={activeFilter} 
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
        <Alert variant="destructive" className="bg-red-900/20 border border-red-900/30">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <AlertTitle className="text-lg font-medium text-white">Error</AlertTitle>
          <AlertDescription className="text-gray-400">
            {error}
            <button 
              onClick={onRetry}
              className="ml-2 text-mywater-blue hover:text-mywater-blue/80 underline"
            >
              Try again
            </button>
          </AlertDescription>
        </Alert>
      ) : requests && requests.length > 0 ? (
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
