
import { useState, useEffect } from "react";
import { collection, query, getDocs, doc, updateDoc, orderBy, limit, where, DocumentData, Timestamp, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Filter as FilterIcon, 
  RefreshCw, 
  Mail,
  User,
  Plus,
  Send,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormInput } from "@/components/shared/FormInput";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sendEmailDirect } from "@/utils/emailUtil";

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

interface Comment {
  id: string;
  author: string;
  content: string;
  created_at: Date;
}

function ClientRequestsContent() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("new");
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showCreateRequestDialog, setShowCreateRequestDialog] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [assignedTechnician, setAssignedTechnician] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const { toast } = useToast();
  
  // New request form state
  const [newRequestForm, setNewRequestForm] = useState({
    user_name: "",
    user_email: "",
    subject: "",
    message: "",
    support_type: "technical",
    purifier_model: "MYWATER X1"
  });
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

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
        const data = doc.data() as DocumentData;
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

  const handleAddComment = async () => {
    if (!selectedRequest || !newComment.trim()) return;

    try {
      const requestRef = doc(db, "support_requests", selectedRequest.id);
      
      // Create new comment
      const comment = {
        id: Date.now().toString(),
        author: commentAuthor || "Admin",
        content: newComment,
        created_at: new Date()
      };
      
      // Get existing comments or initialize empty array
      const existingComments = selectedRequest.comments || [];
      
      // Update request with new comment and assigned technician
      await updateDoc(requestRef, { 
        comments: [...existingComments, comment],
        assigned_to: assignedTechnician || null,
        status: "in_progress", // Ensure status is in_progress
      });
      
      // Update local state
      setRequests(requests.map(request => 
        request.id === selectedRequest.id 
          ? { 
              ...request, 
              comments: [...(request.comments || []), comment],
              assigned_to: assignedTechnician || request.assigned_to,
              status: "in_progress"
            } 
          : request
      ));
      
      // Reset form
      setNewComment("");
      setAssignedTechnician("");
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
          `Dear ${selectedRequest.user_name},\n\nYour support request has been updated. A technician has been assigned to your case.\n\nComment: ${newComment}\n\nThank you for your patience,\nMYWATER Support Team`
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

  const handleCreateRequest = async () => {
    if (!newRequestForm.user_name || !newRequestForm.user_email || !newRequestForm.subject || !newRequestForm.message) {
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
        user_name: newRequestForm.user_name,
        user_email: newRequestForm.user_email,
        subject: newRequestForm.subject,
        message: newRequestForm.message,
        support_type: newRequestForm.support_type,
        purifier_model: newRequestForm.purifier_model,
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

      // Reset form and close dialog
      setNewRequestForm({
        user_name: "",
        user_email: "",
        subject: "",
        message: "",
        support_type: "technical",
        purifier_model: "MYWATER X1"
      });
      
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
            <TabsTrigger value="new" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              New
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              In Progress
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Resolved
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4" />
              All Requests
            </TabsTrigger>
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
              <div 
                key={request.id}
                className="bg-spotify-accent/20 p-4 rounded-md border border-spotify-accent/30 hover:border-spotify-accent/60 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-medium text-white">{request.subject}</h3>
                      <Badge variant={
                        request.status === "new" 
                          ? "default" 
                          : request.status === "in_progress" 
                            ? "secondary" 
                            : "outline"
                      }>
                        {request.support_type}
                      </Badge>
                      <Badge variant={
                        request.status === "new" 
                          ? "destructive" 
                          : request.status === "in_progress" 
                            ? "default" 
                            : "secondary"
                      }>
                        {request.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">
                      From: {request.user_name} ({request.user_email})
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Model: {request.purifier_model}
                    </p>
                    {request.assigned_to && (
                      <p className="text-sm text-mywater-blue mt-1 flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        Assigned to: {request.assigned_to}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {format(request.created_at, "MM/dd/yyyy, h:mm:ss a")}
                  </span>
                </div>
                
                <p className="mt-2 text-white/80 line-clamp-2">{request.message}</p>
                
                {/* Display comments if any */}
                {request.comments && request.comments.length > 0 && (
                  <div className="mt-3 border-t border-gray-700 pt-3">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Comments:</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {request.comments.map((comment) => (
                        <div key={comment.id} className="bg-spotify-accent/40 p-2 rounded text-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-mywater-blue">{comment.author}</span>
                            <span className="text-xs text-gray-500">
                              {comment.created_at instanceof Date 
                                ? format(comment.created_at, "MM/dd/yyyy, h:mm a")
                                : "Unknown date"}
                            </span>
                          </div>
                          <p className="text-white/90 mt-1">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end gap-2 flex-wrap">
                  {request.status !== "in_progress" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowCommentDialog(true);
                        updateRequestStatus(request.id, "in_progress");
                      }}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Mark In Progress
                    </Button>
                  )}
                  
                  {request.status !== "resolved" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateRequestStatus(request.id, "resolved")}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Resolved
                    </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="default"
                    className="bg-mywater-blue hover:bg-mywater-blue/90"
                    onClick={() => handleReplyByEmail(request)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Reply by Email
                  </Button>
                  
                  {request.status === "in_progress" && (
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowCommentDialog(true);
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Comment
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-spotify-accent/20 p-8 rounded-md text-center">
            <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white">No support requests found</h3>
            <p className="text-gray-400 mt-1">
              {activeFilter === "all" 
                ? "There are no support requests in the system yet." 
                : `There are no ${activeFilter.replace("_", " ")} support requests.`}
            </p>
          </div>
        )}
      </Card>
      
      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="bg-spotify-darker border-spotify-accent">
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.status === "in_progress" 
                ? "Add Comment" 
                : "Mark as In Progress"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <FormInput
              label="Your Name"
              value={commentAuthor}
              onChange={setCommentAuthor}
              placeholder="Enter your name"
            />
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Assign to Technician</label>
              <Select value={assignedTechnician} onValueChange={setAssignedTechnician}>
                <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white">
                  <SelectValue placeholder="Select a technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="John Smith">John Smith</SelectItem>
                  <SelectItem value="Emma Johnson">Emma Johnson</SelectItem>
                  <SelectItem value="Michael Davis">Michael Davis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Comment</label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add your comments or instructions here..."
                className="bg-spotify-accent border-spotify-accent-hover text-white min-h-[100px]"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCommentDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Create Request Dialog */}
      <Dialog open={showCreateRequestDialog} onOpenChange={setShowCreateRequestDialog}>
        <DialogContent className="bg-spotify-darker border-spotify-accent max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Support Request</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Name"
                value={newRequestForm.user_name}
                onChange={(value) => setNewRequestForm({...newRequestForm, user_name: value})}
                placeholder="Client name"
                required
              />
              
              <FormInput
                label="Email"
                type="email"
                value={newRequestForm.user_email}
                onChange={(value) => setNewRequestForm({...newRequestForm, user_email: value})}
                placeholder="client@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Support Type</label>
              <Select 
                value={newRequestForm.support_type} 
                onValueChange={(value) => setNewRequestForm({...newRequestForm, support_type: value})}
              >
                <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white">
                  <SelectValue placeholder="Select support type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Support</SelectItem>
                  <SelectItem value="installation">Installation Assistance</SelectItem>
                  <SelectItem value="maintenance">Maintenance Help</SelectItem>
                  <SelectItem value="order">Order Inquiry</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Purifier Model</label>
              <Select 
                value={newRequestForm.purifier_model} 
                onValueChange={(value) => setNewRequestForm({...newRequestForm, purifier_model: value})}
              >
                <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white">
                  <SelectValue placeholder="Select purifier model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MYWATER X1">MYWATER X1</SelectItem>
                  <SelectItem value="MYWATER X2">MYWATER X2</SelectItem>
                  <SelectItem value="MYWATER Pro">MYWATER Pro</SelectItem>
                  <SelectItem value="MYWATER Ultra">MYWATER Ultra</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <FormInput
              label="Subject"
              value={newRequestForm.subject}
              onChange={(value) => setNewRequestForm({...newRequestForm, subject: value})}
              placeholder="Brief description of the issue"
              required
            />
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Message</label>
              <Textarea
                value={newRequestForm.message}
                onChange={(e) => setNewRequestForm({...newRequestForm, message: e.target.value})}
                placeholder="Detailed description of the issue..."
                className="bg-spotify-accent border-spotify-accent-hover text-white min-h-[120px]"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-2">
            <Button 
              variant="outline" 
              onClick={() => setShowCreateRequestDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRequest}
              disabled={isSubmittingRequest}
            >
              {isSubmittingRequest ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
