
import { useState, useEffect } from "react";
import { collection, query, getDocs, doc, updateDoc, orderBy, limit, DocumentData, Timestamp, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { PageHeader } from "@/components/shared/PageHeader";
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
  User
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

export default function ClientRequests() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("new");
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [assignedTechnician, setAssignedTechnician] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const { toast } = useToast();

  // Simulated technicians data
  const technicians = [
    { id: "tech1", name: "John Smith" },
    { id: "tech2", name: "Emma Johnson" },
    { id: "tech3", name: "Michael Davis" },
  ];

  useEffect(() => {
    fetchRequests();
  }, [activeFilter]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      let q;
      // Modified query to avoid requiring composite index
      if (activeFilter === "all") {
        q = query(
          collection(db, "support_requests"),
          orderBy("created_at", "desc"),
          limit(20)
        );
      } else {
        // This simpler query should work without a composite index
        q = query(
          collection(db, "support_requests"),
          orderBy("created_at", "desc"),
          limit(5)
        );
      }

      const querySnapshot = await getDocs(q);
      const requestsData: SupportRequest[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        const createdAt = data.created_at as Timestamp;
        
        // Only include requests matching the filter (if not "all")
        if (activeFilter === "all" || data.status === activeFilter) {
          requestsData.push({
            id: doc.id,
            user_id: data.user_id || "",
            user_name: data.user_name || "",
            user_email: data.user_email || "",
            subject: data.subject || "",
            message: data.message || "",
            support_type: data.support_type || "",
            purifier_model: data.purifier_model || "",
            status: (data.status as "new" | "in_progress" | "resolved") || "new",
            created_at: createdAt ? createdAt.toDate() : new Date(),
            comments: data.comments || [],
            assigned_to: data.assigned_to || "",
          });
        }
      });
      
      setRequests(requestsData);
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
      
      // Optionally, send an email notification to the user
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

  const handleReplyByEmail = async (request: SupportRequest) => {
    try {
      // Simulate email sending
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
    <div className="space-y-6">
      <PageHeader 
        title="Client Support Requests" 
        description="Manage and respond to client support requests"
        icon={MessageSquare}
      />
      
      <Card className="p-4 bg-spotify-darker">
        <div className="flex items-center justify-between mb-4">
          <Tabs 
            defaultValue="new" 
            value={activeFilter}
            onValueChange={setActiveFilter}
            className="w-full"
          >
            <TabsList className="bg-spotify-dark">
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
          
          <Button 
            onClick={fetchRequests}
            variant="outline" 
            size="sm"
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
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
                    <div className="flex items-center gap-2">
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
                
                <p className="mt-2 text-white/80">{request.message}</p>
                
                {/* Display comments if any */}
                {request.comments && request.comments.length > 0 && (
                  <div className="mt-3 border-t border-gray-700 pt-3">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Comments:</h4>
                    <div className="space-y-2">
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
                
                <div className="mt-4 flex justify-end gap-2">
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
                  {technicians.map(tech => (
                    <SelectItem key={tech.id} value={tech.name}>
                      {tech.name}
                    </SelectItem>
                  ))}
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
    </div>
  );
}
