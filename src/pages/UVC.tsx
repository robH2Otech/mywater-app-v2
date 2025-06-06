
import { useState, useCallback } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { UVCList } from "@/components/uvc/UVCList";
import { UVCDetailsHandler } from "@/components/uvc/UVCDetailsHandler";
import { useUVCData, UnitWithUVC } from "@/hooks/uvc/useUVCData";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RefreshCw, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSyncUVCData } from "@/hooks/uvc/useSyncUVCData";

const UVC = () => {
  const [selectedUnit, setSelectedUnit] = useState<UnitWithUVC | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: units = [], isLoading, error, refetch } = useUVCData();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { syncAllUnits, isSyncing } = useSyncUVCData();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["uvc-units"] });
      await refetch();
      
      toast({
        title: "Data refreshed",
        description: "UVC data has been refreshed successfully",
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
  }, [queryClient, refetch, toast]);

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="UVC Maintenance"
          description="Track and manage UVC bulb lifetime and maintenance schedules"
          icon={Lightbulb}
        />
        <div className="bg-red-900/20 border-red-800 p-6 rounded-lg">
          <div className="text-center text-red-400 py-8">
            Error loading UVC data. Please try refreshing the page.
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="UVC Maintenance"
          description="Track and manage UVC bulb lifetime and maintenance schedules"
          icon={Lightbulb}
        />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="UVC Maintenance"
          description="Track and manage UVC bulb lifetime and maintenance schedules"
          icon={Lightbulb}
        />
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing || isSyncing}
          className="bg-mywater-blue hover:bg-mywater-blue/90 text-white flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing || isSyncing ? 'animate-spin' : ''}`} />
          {isRefreshing || isSyncing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>
      
      <UVCList
        units={units}
        onUVCClick={setSelectedUnit}
      />

      <UVCDetailsHandler
        selectedUnit={selectedUnit}
        onClose={() => setSelectedUnit(null)}
      />
    </div>
  );
};

export default UVC;
