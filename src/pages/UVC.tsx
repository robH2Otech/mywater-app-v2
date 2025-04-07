
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { UVCList } from "@/components/uvc/UVCList";
import { UVCDetailsHandler } from "@/components/uvc/UVCDetailsHandler";
import { useUVCData, UnitWithUVC } from "@/hooks/uvc/useUVCData";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const UVC = () => {
  const [selectedUnit, setSelectedUnit] = useState<UnitWithUVC | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: units = [], isLoading, error } = useUVCData();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Function to manually refresh UVC data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["uvc-units"] });
      toast({
        title: "Data refreshed",
        description: "UVC data has been updated",
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

  if (error) {
    console.error("Error in UVC component:", error);
    return <div>Error loading UVC data. Please try again.</div>;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Only show UVC units - filter out DROP and Office units
  const uvcUnits = units.filter(unit => unit.unit_type === 'uvc');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="UVC Maintenance"
          description="Track and manage UVC bulb lifetime and maintenance schedules"
        />
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-mywater-blue hover:bg-mywater-blue/90 text-white flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>
      
      <UVCList
        units={uvcUnits}
        onUVCClick={setSelectedUnit}
      />

      <UVCDetailsHandler
        selectedUnit={selectedUnit}
        onClose={() => setSelectedUnit(null)}
      />
    </div>
  );
};
