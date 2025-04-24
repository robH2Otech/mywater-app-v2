
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface EmptyMeasurementsProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export function EmptyMeasurements({ isLoading, onRefresh }: EmptyMeasurementsProps) {
  if (isLoading) {
    return (
      <div className="h-60 flex items-center justify-center">
        <p className="text-gray-400">Loading measurements...</p>
      </div>
    );
  }
  
  return (
    <div className="h-60 flex items-center justify-center flex-col">
      <p className="text-gray-400 mb-4">No measurements recorded yet</p>
      <Button 
        variant="default"
        size="sm"
        onClick={onRefresh}
        className="bg-spotify-accent hover:bg-spotify-accent/80"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  );
}
