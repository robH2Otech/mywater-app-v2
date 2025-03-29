
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  RefreshCw, 
  Plus,
} from "lucide-react";
import { RequestsTabTrigger } from "@/components/requests/RequestsTabTrigger";
import { RequestCard } from "@/components/requests/RequestCard";
import { CommentDialog } from "@/components/requests/CommentDialog";
import { CreateRequestDialog } from "@/components/requests/CreateRequestDialog";
import { NoRequestsFound } from "@/components/requests/NoRequestsFound";
import { SupportRequest, RequestFormData } from "@/types/supportRequests";
import { 
  fetchSupportRequests, 
  updateRequestStatus, 
  addCommentToRequest, 
  createSupportRequest,
  sendReplyToRequest
} from "@/services/requestService";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

function ClientRequestsContent() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("new");
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showCreateRequestDialog, setShowCreateRequestDialog] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Initial data load - show last 3 requests when opened
  useEffect(() => {
    fetchRequests(3);
  }, []);
  
  // Filter change
  useEffect(() => {
    fetchRequests();
  }, [activeFilter]);

  const fetchRequests = async (count?: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const requestsData = await fetchSupportRequests(activeFilter, count);
      setRequests(requestsData);
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
      fetchRequests();
      
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
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email",
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

  return (
    <div className="space-y-4 md:space-y-6 animate-fadeIn p-2 md:p-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Client Support Requests</h1>
          <p className="text-sm md:text-base text-gray-400">Manage and respond to client support requests</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => fetchRequests()}
            variant="outline" 
            className="w-full md:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            className="bg-mywater-blue hover:bg-mywater-blue/90 w-full md:w-auto"
            onClick={() => setShowCreateRequestDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Request
          </Button>
        </div>
      </div>
      
      <Card className="p-4 bg-spotify-darker">
        <Tabs 
          defaultValue="new" 
          value={activeFilter}
          onValueChange={setActiveFilter}
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
            retryFunction={() => fetchRequests()}
          />
        ) : requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <RequestCard 
                key={request.id} 
                request={request} 
                onAction={handleRequestAction} 
              />
            ))}
          </div>
        ) : (
          <NoRequestsFound filterType={activeFilter} />
        )}
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

export default function ClientRequests() {
  return (
    <Layout>
      <ClientRequestsContent />
    </Layout>
  );
}
