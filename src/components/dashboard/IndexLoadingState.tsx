
import { Loader2 } from "lucide-react";

export const IndexLoadingState = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-gray-400">Loading dashboard data...</p>
      </div>
    </div>
  );
};
