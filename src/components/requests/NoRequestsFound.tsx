
import { MessageSquare } from "lucide-react";

interface NoRequestsFoundProps {
  filterType: string;
}

export function NoRequestsFound({ filterType }: NoRequestsFoundProps) {
  return (
    <div className="bg-spotify-accent/20 p-8 rounded-md text-center">
      <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-white">No support requests found</h3>
      <p className="text-gray-400 mt-1">
        {filterType === "all" 
          ? "There are no support requests in the system yet." 
          : `There are no ${filterType.replace("_", " ")} support requests.`}
      </p>
    </div>
  );
}
