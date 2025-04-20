
import { useState } from "react";
import { SupportRequest, RequestFormData } from "@/types/supportRequests";
import { 
  updateRequestStatus, 
  addCommentToRequest, 
  createSupportRequest,
  sendReplyToRequest 
} from "@/services/requestService";
import { useToast } from "@/hooks/use-toast";

export function useRequestActions(
  requests: SupportRequest[],
  setRequests: (requests: SupportRequest[]) => void,
  refreshRequests: () => void
) {
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showCreateRequestDialog, setShowCreateRequestDialog] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const { toast } = useToast();

  const handleUpdateRequestStatus = async (id: string, status: "new" | "in_progress" | "resolved") => {
    try {
      const updatedRequests = await updateRequestStatus(id, status, requests);
      setRequests(updatedRequests);
      
      toast({
        title: "Status updated",
        description: `Request marked as ${status.replace("_", " ")}`,
      });

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
      setRequests(prev => [newRequest, ...prev]);
      setShowCreateRequestDialog(false);
      
      toast({
        title: "Request created",
        description: "Support request has been successfully created",
      });
      
      refreshRequests();
      
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
      
      refreshRequests();
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error sending email",
        description: "Failed to send email to the user",
        variant: "destructive",
      });
    }
  };

  return {
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
  };
}
