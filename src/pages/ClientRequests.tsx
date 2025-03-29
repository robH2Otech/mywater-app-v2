
import { useState, useEffect } from "react";
import { collection, query, getDocs, doc, updateDoc, orderBy, limit, where, Timestamp, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { 
  RefreshCw, 
  Plus,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendEmailDirect } from "@/utils/emailUtil";
import { RequestsTabTrigger } from "@/components/requests/RequestsTabTrigger";
import { RequestCard } from "@/components/requests/RequestCard";
import { CommentDialog } from "@/components/requests/CommentDialog";
import { CreateRequestDialog, RequestFormData } from "@/components/requests/CreateRequestDialog";
import { NoRequestsFound } from "@/components/requests/NoRequestsFound";

interface Comment {
  id: string;
  author: string;
  content: string;
  created_at: Date;
}

interface SupportRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  subject: string;
  message: string;
  support_type: string;
  purifier_model: string;
  status: "new" | "in_progress" | "resolved";
  created_at: Date;
  comments?: Comment[];
  assigned_to?: string;
}

function ClientRequestsContent() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("new");
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showCreateRequestDialog, setShowCreateRequestDialog] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchRequests();
  }, [activeFilter]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const requestsRef = collection(db, "support_requests");
      let requestsQuery;

      // For "all" filter, show most recent 20
      if (activeFilter === "all") {
        requestsQuery = query(
          requestsRef,
          orderBy("created_at", "desc"),
          limit(20)
        );
      } 
      // For "new" filter, show all unresponded requests
      else if (activeFilter === "new") {
        requestsQuery = query(
          requestsRef,
          where("status", "==", "new"),
          orderBy("created_at", "desc")
        );
      }
      // For other filters, show filtered by status
      else {
        requestsQuery = query(
          requestsRef,
          where("status", "==", activeFilter),
          orderBy("created_at", "desc"),
          limit(5)
        );
      }

      // Get today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all requests
      const querySnapshot = await getDocs(requestsQuery);
      const requestsData: SupportRequest[] = [];
      
      // Today's requests and new requests
      const todayRequests: SupportRequest[] = [];
      const otherRequests: SupportRequest[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.created_at as Timestamp;
        const createdDate = createdAt ? createdAt.toDate() : new Date();
        
        const requestData = {
          id: doc.id,
          user_id: data.user_id || "",
          user_name: data.user_name || "",
          user_email: data.user_email || "",
          subject: data.subject || "",
          message: data.message || "",
          support_type: data.support_type || "",
          purifier_model: data.purifier_model || "",
          status: (data.status as "new" | "in_progress" | "resolved") || "new",
          created_at: createdDate,
          comments: data.comments || [],
          assigned_to: data.assigned_to || "",
        };
        
        // If today's request, add to today array
        if (createdDate >= today) {
          todayRequests.push(requestData);
        } else {
          otherRequests.push(requestData);
        }
      });
      
      // Combine arrays with today's requests first
      setRequests([...todayRequests, ...otherRequests]);
    } catch (error) {
      console.error("Error fetching support requests:", error);
      toast({
        title: "Error",
        description: "Failed to load support requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (id: string, status: "new" | "in_progress" | "resolved") => {
    try {
      const requestRef = doc(db, "support_requests", id);
      await updateDoc(requestRef, { status });
      
      // Update the local state to reflect the change
      setRequests(requests.map(request => 
        request.id === id ? { ...request, status } : request
      ));
      
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
      const requestRef = doc(db, "support_requests", selectedRequest.id);
      
      // Create new comment
      const comment = {
        id: Date.now().toString(),
        author: author || "Admin",
        content: commentText,
        created_at: new Date()
      };
      
      // Get existing comments or initialize empty array
      const existingComments = selectedRequest.comments || [];
      
      // Update request with new comment and assigned technician
      await updateDoc(requestRef, { 
        comments: [...existingComments, comment],
        assigned_to: assignedTo || null,
        status: "in_progress", // Ensure status is in_progress
      });
      
      // Update local state
      setRequests(requests.map(request => 
        request.id === selectedRequest.id 
          ? { 
              ...request, 
              comments: [...(request.comments || []), comment],
              assigned_to: assignedTo || request.assigned_to,
              status: "in_progress"
            } 
          : request
      ));
      
      // Close dialog
      setShowCommentDialog(false);
      
      toast({
        title: "Comment added",
        description: "Your comment has been added to the request",
      });
      
      // Send an email notification to the user
      try {
        await sendEmailDirect(
          selectedRequest.user_email,
          selectedRequest.user_name,
          "MYWATER Support",
          `Update on your support request: ${selectedRequest.subject}`,
          `Dear ${selectedRequest.user_name},\n\nYour support request has been updated. A technician has been assigned to your case.\n\nComment: ${commentText}\n\nThank you for your patience,\nMYWATER Support Team`
        );
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }
      
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
      // Add new request to Firestore
      const newRequest = {
        user_id: Date.now().toString(), // Placeholder ID
        user_name: formData.user_name,
        user_email: formData.user_email,
        subject: formData.subject,
        message: formData.message,
        support_type: formData.support_type,
        purifier_model: formData.purifier_model,
        status: "new" as const,
        created_at: new Date()
      };

      const docRef = await addDoc(collection(db, "support_requests"), newRequest);
      
      // Add to local state with the new ID
      const requestWithId = {
        ...newRequest,
        id: docRef.id
      };
      
      setRequests(prev => [requestWithId, ...prev]);
      
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
      // Send email
      await sendEmailDirect(
        request.user_email,
        request.user_name,
        "MYWATER Support",
        `RE: ${request.subject}`,
        `Dear ${request.user_name},\n\nThank you for contacting MYWATER Support. A team member will assist you shortly.\n\nBest regards,\nMYWATER Support Team`
      );
      
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
      updateRequestStatus(request.id, newStatus);
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
            onClick={fetchRequests}
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
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-spotify-accent/20 p-4 rounded-md animate-pulse h-24"></div>
            ))}
          </div>
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
