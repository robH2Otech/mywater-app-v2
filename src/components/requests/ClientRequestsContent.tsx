
import { Card } from "@/components/ui/card";
import { CommentDialog } from "@/components/requests/CommentDialog";
import { CreateRequestDialog } from "@/components/requests/CreateRequestDialog";
import { RequestsHeader } from "@/components/requests/RequestsHeader";
import { RequestsList } from "@/components/requests/RequestsList";
import { useClientRequests } from "@/hooks/useClientRequests";

export function ClientRequestsContent() {
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

  return (
    <div className="space-y-4 md:space-y-6 animate-fadeIn p-2 md:p-0">
      <RequestsHeader 
        onRefresh={() => fetchRequests()}
        onCreateRequest={() => setShowCreateRequestDialog(true)}
      />
      
      <Card className="p-4 bg-spotify-darker">
        <RequestsList
          requests={requests}
          isLoading={isLoading}
          error={error}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onRetry={() => fetchRequests()}
          onAction={handleRequestAction}
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
