
import { Card } from "@/components/ui/card";
import { CommentDialog } from "@/components/requests/CommentDialog";
import { CreateRequestDialog } from "@/components/requests/CreateRequestDialog";
import { RequestsHeader } from "@/components/requests/RequestsHeader";
import { RequestsList } from "@/components/requests/RequestsList";
import { useClientRequests } from "@/hooks/useClientRequests";
import { useEffect } from "react";
import { usePermissions } from "@/hooks/usePermissions";

export function ClientRequestsContent() {
  const { isCompanyUser } = usePermissions();
  
  const {
    requests,
    isLoading,
    error,
    activeFilter,
    setActiveFilter,
    selectedRequest,
    showCommentDialog,
    setShowCommentDialog,
    showCreateRequestDialog,
    setShowCreateRequestDialog,
    isSubmittingRequest,
    fetchRequests,
    handleAddComment,
    handleCreateRequest,
    handleRequestAction
  } = useClientRequests();

  // Add a retry handler to refresh the data and clear errors
  const handleRetry = () => {
    console.log("Retry requested - refreshing data");
    fetchRequests();
  };

  // Log the current state for debugging
  useEffect(() => {
    console.log(`ClientRequestsContent - Requests count: ${requests?.length || 0}, Filter: ${activeFilter}, Error: ${error ? 'Yes' : 'No'}`);
  }, [requests, activeFilter, error]);

  return (
    <div className="space-y-4 md:space-y-6 animate-fadeIn p-2 md:p-0">
      <RequestsHeader 
        onRefresh={handleRetry}
        onCreateRequest={() => setShowCreateRequestDialog(true)}
        isReadOnly={isCompanyUser()}
      />
      
      <Card className="p-4 bg-spotify-darker">
        <RequestsList
          requests={requests}
          isLoading={isLoading}
          error={error}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onRetry={handleRetry}
          onAction={handleRequestAction}
          isReadOnly={isCompanyUser()}
        />
      </Card>
      
      {/* Comment Dialog */}
      <CommentDialog
        open={showCommentDialog}
        onOpenChange={setShowCommentDialog}
        selectedRequest={selectedRequest}
        onSaveComment={handleAddComment}
      />
      
      {/* Create Request Dialog */}
      <CreateRequestDialog
        open={showCreateRequestDialog}
        onOpenChange={setShowCreateRequestDialog}
        onSubmit={handleCreateRequest}
        isSubmitting={isSubmittingRequest}
      />
    </div>
  );
}
