
import { useState, useEffect } from "react";
import { collection, query, getDocs, doc, updateDoc, orderBy, where, DocumentData, Timestamp } from "firebase/firestore";
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
  Mail 
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

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
}

export default function ClientRequests() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("new");
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [activeFilter]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      let q;
      if (activeFilter === "all") {
        q = query(
          collection(db, "support_requests"),
          orderBy("created_at", "desc")
        );
      } else {
        q = query(
          collection(db, "support_requests"),
          where("status", "==", activeFilter === "new" 
            ? "new" 
            : activeFilter === "in_progress" 
              ? "in_progress" 
              : "resolved"),
          orderBy("created_at", "desc")
        );
      }

      const querySnapshot = await getDocs(q);
      const requestsData: SupportRequest[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        const createdAt = data.created_at as Timestamp;
        
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
        });
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
    } catch (error) {
      console.error("Error updating request status:", error);
      toast({
        title: "Error",
        description: "Failed to update request status",
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
                  </div>
                  <span className="text-xs text-gray-400">
                    {format(request.created_at, "MM/dd/yyyy, h:mm:ss a")}
                  </span>
                </div>
                
                <p className="mt-2 text-white/80">{request.message}</p>
                
                <div className="mt-4 flex justify-end gap-2">
                  {request.status !== "in_progress" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateRequestStatus(request.id, "in_progress")}
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
                    onClick={() => window.location.href = `mailto:${request.user_email}?subject=Re: ${request.subject}`}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Reply by Email
                  </Button>
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
    </div>
  );
}
