
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";

interface RequestsHeaderProps {
  onRefresh: () => void;
  onCreateRequest: () => void;
  isReadOnly?: boolean;
}

export function RequestsHeader({ onRefresh, onCreateRequest, isReadOnly }: RequestsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Client Support Requests</h1>
        <p className="text-sm md:text-base text-gray-400">Manage and respond to client support requests</p>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={onRefresh}
          variant="outline" 
          className="w-full md:w-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        {!isReadOnly && (
          <Button 
            className="bg-mywater-blue hover:bg-mywater-blue/90 w-full md:w-auto"
            onClick={onCreateRequest}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Request
          </Button>
        )}
      </div>
    </div>
  );
}
