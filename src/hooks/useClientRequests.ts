
import { useEffect, useState } from "react";
import { SupportRequest } from "@/types/supportRequests";
import { useRequestFilter } from "./requests/useRequestFilter";
import { useRequestActions } from "./requests/useRequestActions";
import { usePermissions } from "@/hooks/usePermissions";
import { logAuditEvent } from "@/utils/auth/securityUtils";

export function useClientRequests() {
  const { company, userRole } = usePermissions();
  const [rateLimitStatus, setRateLimitStatus] = useState({
    remaining: 100,
    resetTime: null as Date | null
  });
  
  const {
    activeFilter,
    requests,
    isLoading,
    error,
    setActiveFilter,
    fetchRequests
  } = useRequestFilter();
  
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
  } = useRequestActions(requests, () => {
    // Re-fetch requests instead of trying to update the state directly
    fetchRequests();
  }, fetchRequests);

  // Initial data load with company filter
  useEffect(() => {
    // Pass the company filter to ensure we only get data for the user's company
    fetchRequests(5, company || undefined);
    
    // Track data access for audit purposes
    logAuditEvent('data_access', {
      type: 'client_requests',
      filter: 'initial_load',
      company
    });
  }, [company]);
  
  // Filter change
  useEffect(() => {
    if (activeFilter) {
      console.log(`Active filter changed to: ${activeFilter}`);
      // Always pass company to ensure data isolation
      fetchRequests(undefined, company || undefined);
      
      // Track filter changes for audit
      logAuditEvent('data_access', {
        type: 'client_requests',
        filter: activeFilter,
        company
      });
    }
  }, [activeFilter]);
  
  // Rate limit monitoring
  const checkRateLimit = () => {
    // In a real implementation, this would call an API to check rate limit status
    // For now, we just simulate a rate limit
    const remaining = Math.max(0, rateLimitStatus.remaining - 1);
    setRateLimitStatus({
      remaining,
      resetTime: remaining <= 0 ? new Date(Date.now() + 60000) : null // Reset in 1 minute if exhausted
    });
    
    return remaining > 0;
  };

  const handleRequestAction = async (
    action: 'status' | 'email' | 'comment',
    request: SupportRequest,
    newStatus?: "new" | "in_progress" | "resolved"
  ) => {
    // Security: Verify user's company matches the request's company
    if (request.company && company && request.company !== company && userRole !== 'superadmin') {
      console.error("Security violation: Attempted to access request from different company");
      logAuditEvent('security_violation', {
        type: 'cross_company_access',
        action,
        requestId: request.id,
        requestCompany: request.company,
        userCompany: company
      }, 'critical');
      return;
    }
    
    // Check rate limit before proceeding
    if (!checkRateLimit()) {
      console.log("Rate limit exceeded, please try again later");
      // In a real app, show a toast message to the user
      return;
    }
    
    // If user role is "user", they can only add comments
    if (userRole === 'user' && action !== 'comment') {
      console.log("User role can only add comments");
      logAuditEvent('permission_denied', {
        action,
        requestId: request.id,
        role: userRole
      });
      return;
    }
    
    // Log the action for audit trail
    logAuditEvent('request_action', {
      action,
      requestId: request.id,
      newStatus,
      company
    });
    
    if (action === 'status' && newStatus) {
      await handleUpdateRequestStatus(request.id, newStatus);
    } else if (action === 'email') {
      await handleReplyByEmail(request);
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
    handleRequestAction,
    rateLimitStatus
  };
}
