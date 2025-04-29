
import { useState, useCallback, useEffect } from "react";
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

  // Function to manually refresh UVC data with improved sync
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Invalidate queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ["uvc-units"] });
      await queryClient.invalidateQueries({ queryKey: ["units"] });
      await queryClient.invalidateQueries({ queryKey: ["measurements"] });
      
      // First sync all units to update unit records with latest measurement data
      if (units.length > 0) {
        await syncAllUnits(units);
      }
      
      // Explicitly refetch UVC data
      await refetch();
      
      toast({
        title: "Data refreshed",
        description: "UVC data has been synchronized with latest measurements",
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
  }, [queryClient, refetch, toast, syncAllUnits, units]);

  // Auto-sync when component mounts
  useEffect(() => {
    const initialSync = async () => {
      if (!isLoading && units.length > 0 && !isRefreshing && !isSyncing) {
        console.log("Performing initial UVC data sync...");
        await handleRefresh();
      }
    };
    
    initialSync();
  }, [isLoading, units.length]); // Run when loading completes and units are available

  if (error) {
    console.error("Error in UVC component:", error);
    return <div>Error loading UVC data. Please try again.</div>;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
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
          {isRefreshing || isSyncing ? "Syncing..." : "Refresh Data"}
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
