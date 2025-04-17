
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchRecentRequests } from "@/services/requestService";
import { SupportRequest } from "@/types/supportRequests";
import { MessageSquare, Send, Clock, CheckCircle2, RefreshCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EmailSender } from "@/components/requests/EmailSender";

export function RecentRequestsTab() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadRequests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const recentRequests = await fetchRecentRequests(7); // Last 7 days
      setRequests(recentRequests);
    } catch (err) {
      console.error("Error loading recent requests:", err);
      setError("Failed to load recent requests");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load requests on initial render
  useEffect(() => {
    loadRequests();
  }, []);
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 h-32"></div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <p className="text-sm text-gray-400">{error}</p>
        <Button 
          onClick={loadRequests} 
          variant="secondary" 
          className="mt-2"
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }
  
  if (!requests || requests.length === 0) {
    return (
      <div className="text-center p-8">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Recent Requests</h3>
        <p className="text-gray-400">There have been no client requests in the last 7 days.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id} className="p-4 bg-spotify-dark hover:bg-spotify-dark/90 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{request.subject}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  request.status === "new" ? "bg-orange-500/20 text-orange-300" :
                  request.status === "in_progress" ? "bg-blue-500/20 text-blue-300" :
                  "bg-green-500/20 text-green-300"
                }`}>
                  {request.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-400">From: {request.user_name} ({request.user_email})</p>
            </div>
            <div className="text-xs text-gray-400">
              {request.created_at && formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
            </div>
          </div>
          
          <p className="text-sm mb-4 line-clamp-2">{request.message}</p>
          
          <div className="flex justify-end gap-2">
            <EmailSender 
              request={request} 
              onEmailSent={() => loadRequests()} 
            />
          </div>
        </Card>
      ))}
      
      <div className="mt-4 text-center">
        <Button 
          variant="outline" 
          onClick={() => loadRequests()}
          className="text-sm"
        >
          <RefreshCcw className="mr-2 h-3.5 w-3.5" />
          Refresh Requests
        </Button>
      </div>
    </div>
  );
}
