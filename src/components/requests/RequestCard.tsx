
import { SupportRequest } from "@/types/supportRequests";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Lightbulb, Wrench, Package, AlertCircle, Clock, CheckCircle2, MessageSquare } from "lucide-react";
import { EmailSender } from "./EmailSender";

interface RequestCardProps {
  request: SupportRequest;
  onStatusChange: (status: "new" | "in_progress" | "resolved") => void;
  onComment: () => void;
  onEmail: () => void;
  isEmailSending?: boolean;
}

const getSupportTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'installation':
    case 'technical':
      return <Wrench className="h-5 w-5" />;
    case 'maintenance':
      return <Lightbulb className="h-5 w-5" />;
    case 'product':
      return <Package className="h-5 w-5" />;
    default:
      return <AlertCircle className="h-5 w-5" />;
  }
};

const getStatusClasses = (status: string) => {
  switch (status) {
    case 'new':
      return "bg-orange-500 text-white";
    case 'in_progress':
      return "bg-blue-500 text-white";
    case 'resolved':
      return "bg-green-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

export function RequestCard({ 
  request, 
  onStatusChange, 
  onComment,
  onEmail
}: RequestCardProps) {
  const formattedTime = request.created_at 
    ? formatDistanceToNow(new Date(request.created_at), { addSuffix: true })
    : 'Unknown time';
    
  const timeString = request.created_at
    ? new Date(request.created_at).toLocaleString()
    : 'Unknown date';
    
  return (
    <Card className="bg-spotify-dark hover:bg-spotify-dark/80 transition-colors">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">{request.subject}</h3>
              <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusClasses(request.status)}`}>
                {request.status.replace('_', ' ')}
              </span>
              {request.support_type && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-200">
                  {request.support_type}
                </span>
              )}
            </div>
            
            <p className="text-gray-400 text-sm">From: {request.user_name} ({request.user_email})</p>
            {request.purifier_model && (
              <p className="text-gray-400 text-sm">Model: {request.purifier_model}</p>
            )}
            <p className="mt-2">{request.message}</p>
          </div>
          
          <div className="text-right text-sm text-gray-400">
            <time title={timeString}>{formattedTime}</time>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 border-t border-gray-800 flex justify-end gap-2 flex-wrap">
        {request.status !== "in_progress" && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onStatusChange("in_progress")}
            className="flex gap-1 items-center"
          >
            <Clock className="h-4 w-4" />
            <span>Mark In Progress</span>
          </Button>
        )}
        
        {request.status !== "resolved" && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onStatusChange("resolved")}
            className="flex gap-1 items-center"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Mark Resolved</span>
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onComment}
          className="flex gap-1 items-center"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Comment</span>
        </Button>
        
        <EmailSender request={request} onEmailSent={onEmail} />
      </CardFooter>
    </Card>
  );
}
