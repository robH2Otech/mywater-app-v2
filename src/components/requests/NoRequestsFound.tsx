
import { AlertCircle, MessageSquare } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface NoRequestsFoundProps {
  filterType: string;
  error?: boolean;
  errorMessage?: string;
  retryFunction?: () => void;
}

export function NoRequestsFound({ 
  filterType, 
  error = false, 
  errorMessage,
  retryFunction
}: NoRequestsFoundProps) {
  console.log(`NoRequestsFound: filterType=${filterType}, error=${error}, errorMessage=${errorMessage}`);
  
  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-900/20 border border-red-900/30">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <AlertTitle className="text-lg font-medium text-white">Error</AlertTitle>
        <AlertDescription className="text-gray-400">
          {errorMessage || "Failed to load support requests"}
          {retryFunction && (
            <button 
              onClick={retryFunction}
              className="ml-2 text-mywater-blue hover:text-mywater-blue/80 underline"
            >
              Try again
            </button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  let message = "There are no support requests in the system yet.";
  
  if (filterType === "new") {
    message = "There are no new support requests waiting for action.";
  } else if (filterType === "in_progress") {
    message = "There are no support requests currently in progress.";
  } else if (filterType === "resolved") {
    message = "There are no resolved support requests to display.";
  }

  return (
    <div className="bg-spotify-accent/20 p-8 rounded-md text-center">
      <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-white">No support requests found</h3>
      <p className="text-gray-400 mt-1">{message}</p>
    </div>
  );
}
