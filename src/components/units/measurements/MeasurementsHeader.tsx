
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface MeasurementsHeaderProps {
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  lastRefreshed: Date | null;
}

export function MeasurementsHeader({ 
  isLoading,
  isRefreshing,
  onRefresh,
  lastRefreshed
}: MeasurementsHeaderProps) {
  // Format last refreshed time
  const lastRefreshDisplay = lastRefreshed 
    ? `Last refreshed: ${lastRefreshed.toLocaleTimeString()}` 
    : '';
    
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Last 24 hours Water Data</h2>
        {lastRefreshDisplay && (
          <p className="text-xs text-gray-400">{lastRefreshDisplay}</p>
        )}
      </div>
      <div className="flex items-center">
        {isLoading && <span className="text-gray-400 text-sm mr-3">Syncing...</span>}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="border-spotify-accent text-white hover:bg-spotify-accent/20"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
