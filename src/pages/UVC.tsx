
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

  // Function to manually refresh UVC data
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      console.log("🔄 Manual refresh triggered for UVC data");
      
      // Invalidate all related queries first
      await queryClient.invalidateQueries({ queryKey: ["uvc-units"] });
      await queryClient.invalidateQueries({ queryKey: ["units"] });
      await queryClient.invalidateQueries({ queryKey: ["measurements"] });
      
      // Explicitly refetch UVC data to get latest unit list
      const freshData = await refetch();
      const freshUnits = freshData.data || [];
      
      // Force sync all units if needed
      if (freshUnits.length > 0) {
        console.log(`🎯 Syncing ${freshUnits.length} UVC units`);
        await syncAllUnits(freshUnits);
      }
      
      toast({
        title: "Data refreshed",
        description: "UVC data has been synchronized with latest measurements",
      });
    } catch (error) {
      console.error("❌ Error refreshing UVC data:", error);
      toast({
        title: "Refresh failed",
        description: "Could not refresh UVC data",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, refetch, toast, syncAllUnits]);

  // Auto-sync when component mounts if needed
  useEffect(() => {
    const performInitialSync = async () => {
      if (!isLoading && units.length > 0 && !isRefreshing && !isSyncing) {
        // Check if any units need syncing (showing 0 hours when they shouldn't)
        const unitsNeedingSync = units.filter(unit => {
          const hasZeroHours = !unit.uvc_hours || unit.uvc_hours === 0;
          const notAccumulated = !unit.is_uvc_accumulated;
          return unit.unit_type === 'uvc' && (hasZeroHours || notAccumulated);
        });
        
        if (unitsNeedingSync.length > 0) {
          console.log(`🎯 Found ${unitsNeedingSync.length} units needing sync:`, unitsNeedingSync.map(u => u.id));
          await syncAllUnits(units);
        } else {
          console.log("✅ All UVC units appear to be synced");
        }
      }
    };
    
    // Delay initial sync slightly to allow component to mount
    const timer = setTimeout(performInitialSync, 1000);
    return () => clearTimeout(timer);
  }, [isLoading, units, isRefreshing, isSyncing, syncAllUnits]);

  if (error) {
    console.error("❌ Error in UVC component:", error);
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
