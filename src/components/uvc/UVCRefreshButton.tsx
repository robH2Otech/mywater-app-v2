
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface UVCRefreshButtonProps {
  onRefresh?: () => void;
  className?: string;
}

export function UVCRefreshButton({ onRefresh, className = "" }: UVCRefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Invalidate all relevant queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ["uvc-units"] });
      await queryClient.invalidateQueries({ queryKey: ["units"] });
      await queryClient.invalidateQueries({ queryKey: ["measurements"] });
      
      // Call the custom refresh handler if provided
      if (onRefresh) {
        await onRefresh();
      }
      
      toast({
        title: "Data refreshed",
        description: "UVC data has been updated from latest measurements",
      });
    } catch (error) {
      console.error("Error refreshing UVC data:", error);
      toast({
        title: "Refresh failed",
        description: "Could not refresh UVC data",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`bg-mywater-blue hover:bg-mywater-blue/90 text-white flex items-center gap-2 ${className}`}
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? "Refreshing..." : "Refresh Data"}
    </Button>
  );
}
