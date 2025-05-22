
import { useEffect } from "react";
import { SupportRequest } from "@/types/supportRequests";
import { useRequestFilter } from "./requests/useRequestFilter";
import { useRequestActions } from "./requests/useRequestActions";
import { usePermissions } from "@/hooks/usePermissions";

export function useClientRequests() {
  const { company, userRole } = usePermissions();
  
  const {
    activeFilter,
    requests,
    isLoading,
    error,
    setActiveFilter,
    fetchRequests
  } = useRequestFilter(); // No arguments needed here
  
  const {
    selectedRequest,
    showCommentDialog,
    setShowCommentDialog,
    showCreateRequestDialog,
    setShowCreateRequestDialog,
    isSubmittingRequest,
    handleUpdateRequestStatus,
    handleAddComment,
    handleCreateRequest,
    handleReplyByEmail,
    setSelectedRequest
  } = useRequestActions(requests, (newRequests: SupportRequest[]) => {
    // Re-fetch requests instead of trying to update the state directly
    fetchRequests();
  }, fetchRequests);

  // Initial data load
  useEffect(() => {
    fetchRequests(5);
  }, []);
  
  // Filter change
  useEffect(() => {
    if (activeFilter) {
      console.log(`Active filter changed to: ${activeFilter}`);
      fetchRequests();
    }
  }, [activeFilter]);

  const handleRequestAction = (
    action: 'status' | 'email' | 'comment',
    request: SupportRequest,
    newStatus?: "new" | "in_progress" | "resolved"
  ) => {
    // If user role is "user", they can only add comments
    if (userRole === 'user' && action !== 'comment') {
      console.log("User role can only add comments");
      return;
    }
    
    if (action === 'status' && newStatus) {
      handleUpdateRequestStatus(request.id, newStatus);
    } else if (action === 'email') {
      handleReplyByEmail(request);
    } else if (action === 'comment') {
      setSelectedRequest(request);
      setShowCommentDialog(true);
    }
  };

  return {
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
  };
}
