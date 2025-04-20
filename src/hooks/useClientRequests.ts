
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { SupportRequest, RequestFormData } from "@/types/supportRequests";
import { 
  fetchSupportRequests, 
  updateRequestStatus, 
  addCommentToRequest, 
  createSupportRequest,
  sendReplyToRequest
} from "@/services/requestService";

export function useClientRequests() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showCreateRequestDialog, setShowCreateRequestDialog] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Initial data load - show all requests when opened to ensure something displays
  useEffect(() => {
    fetchRequestsData(5);
  }, []);
  
  // Filter change
  useEffect(() => {
    if (activeFilter) {
      console.log(`Active filter changed to: ${activeFilter}`);
      fetchRequestsData();
    }
  }, [activeFilter]);

  const fetchRequestsData = useCallback(async (count?: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching requests with filter: ${activeFilter}, count: ${count || 5}`);
      const requestsData = await fetchSupportRequests(activeFilter, count || 5);
      
      if (requestsData.length === 0) {
        console.log("No requests found for the current filter");
      } else {
        console.log(`Successfully fetched ${requestsData.length} requests`);
      }
      
      setRequests(requestsData);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error fetching support requests:", error);
      setError("Failed to load support requests");
      toast({
        title: "Error",
        description: "Failed to load support requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, toast]);

  const handleFilterChange = (filter: string) => {
    console.log(`Changing filter from ${activeFilter} to ${filter}`);
    setActiveFilter(filter);
  };

  const handleUpdateRequestStatus = async (id: string, status: "new" | "in_progress" | "resolved") => {
    try {
      const updatedRequests = await updateRequestStatus(id, status, requests);
      setRequests(updatedRequests);
      
      toast({
        title: "Status updated",
        description: `Request marked as ${status.replace("_", " ")}`,
      });

      // If status is changed to in progress, open the comment dialog
      if (status === "in_progress") {
        const request = requests.find(r => r.id === id);
        if (request) {
          setSelectedRequest(request);
          setShowCommentDialog(true);
        }
      }
    } catch (error) {
      console.error("Error updating request status:", error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async (commentText: string, author: string, assignedTo: string) => {
    if (!selectedRequest) return;

    try {
      const updatedRequests = await addCommentToRequest(
        selectedRequest, 
        commentText, 
        author, 
        assignedTo, 
        requests
      );
      
      setRequests(updatedRequests);
      setShowCommentDialog(false);
      
      toast({
        title: "Comment added",
        description: "Your comment has been added to the request",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleCreateRequest = async (formData: RequestFormData) => {
    if (!formData.user_name || !formData.user_email || !formData.subject || !formData.message) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingRequest(true);

    try {
      const newRequest = await createSupportRequest(formData);
      
      // Add to local state with the new ID
      setRequests(prev => [newRequest, ...prev]);
      
      // Close dialog
      setShowCreateRequestDialog(false);
      
      toast({
        title: "Request created",
        description: "Support request has been successfully created",
      });
      
      // Refresh to ensure we have the most up-to-date data
      fetchRequestsData();
      
    } catch (error) {
      console.error("Error creating support request:", error);
      toast({
        title: "Error",
        description: "Failed to create support request",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleReplyByEmail = async (request: SupportRequest) => {
    try {
      await sendReplyToRequest(request);
      
      toast({
        title: "Email sent",
        description: `Reply sent to ${request.user_email}`,
      });
      
      // Refresh the requests to show updated state
      fetchRequestsData();
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error sending email",
        description: "Failed to send email to the user",
        variant: "destructive",
      });
    }
  };

  const handleRequestAction = (action: 'status' | 'email' | 'comment', request: SupportRequest, newStatus?: "new" | "in_progress" | "resolved") => {
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
    setActiveFilter: handleFilterChange,
    selectedRequest,
    showCommentDialog,
    setShowCommentDialog,
    showCreateRequestDialog,
    setShowCreateRequestDialog,
    isSubmittingRequest,
    fetchRequests: fetchRequestsData,
    handleAddComment,
    handleCreateRequest,
    handleRequestAction
  };
}
