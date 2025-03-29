
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Mail
} from "lucide-react";

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

interface RequestCardProps {
  request: SupportRequest;
  onAction: (action: 'status' | 'email' | 'comment', request: SupportRequest, newStatus?: "new" | "in_progress" | "resolved") => void;
}

export function RequestCard({ request, onAction }: RequestCardProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "new": return "destructive";
      case "in_progress": return "default";
      case "resolved": return "secondary";
      default: return "outline";
    }
  };

  const getSupportTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "technical": return "default";
      case "installation": return "secondary";
      case "maintenance": return "outline";
      case "order": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div 
      className="bg-spotify-accent/20 p-4 rounded-md border border-spotify-accent/30 hover:border-spotify-accent/60 transition-colors mb-4"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-medium text-white">{request.subject}</h3>
            <Badge variant={getSupportTypeBadgeVariant(request.support_type)}>
              {request.support_type}
            </Badge>
            <Badge variant={getStatusBadgeVariant(request.status)}>
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
            <p className="text-sm text-mywater-blue mt-1">
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
            onClick={() => onAction('status', request, "in_progress")}
          >
            <Clock className="h-4 w-4 mr-2" />
            Mark In Progress
          </Button>
        )}
        
        {request.status !== "resolved" && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onAction('status', request, "resolved")}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark Resolved
          </Button>
        )}
        
        <Button 
          size="sm" 
          variant="default"
          className="bg-mywater-blue hover:bg-mywater-blue/90"
          onClick={() => onAction('email', request)}
        >
          <Mail className="h-4 w-4 mr-2" />
          Reply by Email
        </Button>
        
        {request.status === "in_progress" && (
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => onAction('comment', request)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Add Comment
          </Button>
        )}
      </div>
    </div>
  );
}
