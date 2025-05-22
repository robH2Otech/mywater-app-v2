
import { SupportRequest } from "@/types/supportRequests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from "lucide-react";

interface RequestCardProps {
  request: SupportRequest;
  onStatusChange: (status: "new" | "in_progress" | "resolved") => void;
  onComment: () => void;
  onEmail: () => void;
  isEmailSending?: boolean;
  isReadOnly?: boolean;
}

export function RequestCard({
  request,
  onStatusChange,
  onComment,
  onEmail,
  isEmailSending = false,
  isReadOnly = false
}: RequestCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-500 hover:bg-blue-600";
      case "in_progress": return "bg-amber-500 hover:bg-amber-600";
      case "resolved": return "bg-green-500 hover:bg-green-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new": return <AlertCircle className="h-4 w-4 mr-1" />;
      case "in_progress": return <Clock className="h-4 w-4 mr-1" />;
      case "resolved": return <CheckCircle2 className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };
  
  const timeAgo = formatDistanceToNow(new Date(request.created_at), { addSuffix: true });
  
  return (
    <div className="bg-spotify-accent rounded-lg p-4 transition-all hover:bg-spotify-accent-hover">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-white">{request.subject}</h3>
            <Badge 
              className={`${getStatusColor(request.status)} text-white`}
            >
              <div className="flex items-center">
                {getStatusIcon(request.status)}
                {request.status.replace("_", " ")}
              </div>
            </Badge>
          </div>
          
          <div className="text-sm text-gray-400 mt-1">
            From: {request.user_name} ({request.user_email})
          </div>
          
          <div className="text-sm text-gray-400">
            Type: {request.support_type} • Model: {request.purifier_model}
          </div>
          
          <p className="mt-3 text-sm text-gray-300">{request.message}</p>
          
          {request.comments && request.comments.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-400">
                {request.comments.length} comment{request.comments.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-3">Created {timeAgo}</div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          {!isReadOnly && request.status !== "resolved" && (
            <Button 
              size="sm" 
              variant="outline"
              className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/30"
              onClick={() => onStatusChange("resolved")}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Resolve
            </Button>
          )}
          
          {!isReadOnly && request.status === "new" && (
            <Button 
              size="sm" 
              variant="outline"
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/30"
              onClick={() => onStatusChange("in_progress")}
            >
              <Clock className="h-4 w-4 mr-1" />
              In Progress
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="outline"
            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border-blue-500/30"
            onClick={onComment}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Comment
          </Button>
          
          {!isReadOnly && (
            <Button 
              size="sm" 
              variant="outline"
              className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border-purple-500/30"
              onClick={onEmail}
              disabled={isEmailSending}
            >
              {isEmailSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Email
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
