
import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { Inbox, CheckCircle, Clock, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SupportRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  subject: string;
  message: string;
  support_type: string;
  purifier_model: string;
  status: string;
  created_at: Date;
  updated_at?: Date;
  assigned_to?: string;
}

export function ClientRequests() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("new");
  const { toast } = useToast();

  const fetchRequests = async () => {
    setIsLoading(true);
    
    try {
      const requestsQuery = query(
        collection(db, "support_requests"),
        orderBy("created_at", "desc")
      );
      
      const querySnapshot = await getDocs(requestsQuery);
      const requestsData: SupportRequest[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        requestsData.push({
          id: doc.id,
          ...data,
          created_at: data.created_at.toDate(),
          updated_at: data.updated_at ? data.updated_at.toDate() : undefined
        } as SupportRequest);
      });
      
      setRequests(requestsData);
    } catch (error) {
      console.error("Error fetching support requests:", error);
      toast({
        title: "Failed to load requests",
        description: "There was an error loading support requests.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRequests();
  }, []);
  
  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "support_requests", requestId), {
        status: newStatus,
        updated_at: new Date()
      });
      
      // Update local state
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: newStatus, updated_at: new Date() } 
            : req
        )
      );
      
      toast({
        title: "Status updated",
        description: `Request status updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating request status:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the request status.",
        variant: "destructive",
      });
    }
  };
  
  const getFilteredRequests = () => {
    return requests.filter(req => {
      if (activeTab === "new") return req.status === "new";
      if (activeTab === "in-progress") return req.status === "in-progress";
      if (activeTab === "resolved") return req.status === "resolved";
      return true; // 'all' tab
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500">New</Badge>;
      case "in-progress":
        return <Badge className="bg-orange-500">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-500">Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const formatSupportType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, " ");
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <PageHeader
          title="Client Support Requests"
          description="Manage and respond to client support requests"
          icon={Inbox}
        />
      
        <Card className="mt-6 bg-spotify-darker border-spotify-accent">
          <div className="p-6">
            <Tabs defaultValue="new" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-6">
                <TabsList className="bg-spotify-dark">
                  <TabsTrigger value="new" className="flex items-center">
                    <Inbox className="h-4 w-4 mr-2" />
                    New
                  </TabsTrigger>
                  <TabsTrigger value="in-progress" className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    In Progress
                  </TabsTrigger>
                  <TabsTrigger value="resolved" className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolved
                  </TabsTrigger>
                  <TabsTrigger value="all" className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    All Requests
                  </TabsTrigger>
                </TabsList>
                
                <Button onClick={fetchRequests} disabled={isLoading}>
                  {isLoading ? "Loading..." : "Refresh"}
                </Button>
              </div>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">Loading support requests...</p>
                </div>
              ) : (
                <>
                  {["new", "in-progress", "resolved", "all"].map(tab => (
                    <TabsContent value={tab} key={tab}>
                      {getFilteredRequests().length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-400">No {tab !== 'all' ? tab : ''} support requests found.</p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[calc(100vh-300px)]">
                          <div className="space-y-4">
                            {getFilteredRequests().map((request) => (
                              <Card key={request.id} className="bg-spotify-dark border-spotify-accent p-4">
                                <div className="flex flex-col space-y-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="text-lg font-semibold text-white">{request.subject}</h3>
                                      <p className="text-sm text-gray-400">
                                        From: {request.user_name} ({request.user_email})
                                      </p>
                                      <div className="flex space-x-2 mt-1">
                                        {getStatusBadge(request.status)}
                                        <Badge variant="outline">{formatSupportType(request.support_type)}</Badge>
                                        <Badge variant="outline">{request.purifier_model}</Badge>
                                      </div>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                      {new Date(request.created_at).toLocaleString()}
                                    </p>
                                  </div>
                                  
                                  <Separator className="bg-spotify-accent" />
                                  
                                  <div>
                                    <p className="text-sm text-gray-200 whitespace-pre-wrap">{request.message}</p>
                                  </div>
                                  
                                  <div className="flex space-x-2 justify-end">
                                    {request.status === "new" && (
                                      <Button 
                                        size="sm" 
                                        onClick={() => updateRequestStatus(request.id, "in-progress")}
                                        className="bg-mywater-blue hover:bg-mywater-blue/90"
                                      >
                                        Mark In Progress
                                      </Button>
                                    )}
                                    
                                    {request.status === "in-progress" && (
                                      <Button 
                                        size="sm" 
                                        onClick={() => updateRequestStatus(request.id, "resolved")}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        Mark Resolved
                                      </Button>
                                    )}
                                    
                                    {request.status === "resolved" && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => updateRequestStatus(request.id, "in-progress")}
                                      >
                                        Reopen
                                      </Button>
                                    )}
                                    
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => window.location.href = `mailto:${request.user_email}?subject=Re: ${request.subject}`}
                                    >
                                      Reply by Email
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </TabsContent>
                  ))}
                </>
              )}
            </Tabs>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
