
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lightbulb, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatDecimal } from "@/utils/measurements/formatUtils";
import { UVCProgressBar } from "./UVCProgressBar";
import { UVCDialogForm } from "./UVCDialogForm";
import { UVCDialogActions } from "./UVCDialogActions";
import { UVCDialogLoader } from "./UVCDialogLoader";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useUVCDetailsData } from "@/hooks/uvc/useUVCDetailsData";

interface UVCDetailsDialogProps {
  unit: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedData: any) => void;
  isSaving?: boolean;
}

export function UVCDetailsDialog({ 
  unit, 
  open, 
  onOpenChange, 
  onSave,
  isSaving = false
}: UVCDetailsDialogProps) {
  const [formData, setFormData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading, refetch, lastUpdated } = useUVCDetailsData(unit?.id, open);

  // Update form data when data is loaded
  useEffect(() => {
    if (data) {
      setFormData({
        uvc_hours: formatDecimal(data.uvc_hours || 0),
        uvc_installation_date: data.uvc_installation_date ? new Date(data.uvc_installation_date) : null,
      });
    }
  }, [data]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Invalidate queries to ensure fresh data
    await queryClient.invalidateQueries({ queryKey: ["uvc-units"] });
    await queryClient.invalidateQueries({ queryKey: ["units"] });
    await queryClient.invalidateQueries({ queryKey: ["unit", unit?.id] });
    await queryClient.invalidateQueries({ queryKey: ["measurements"] });
    
    // Fetch latest data
    await refetch();
    
    toast({
      title: "Data refreshed",
      description: "UVC data has been updated with latest measurements",
    });
    
    setIsRefreshing(false);
  };

  const handleSave = () => {
    if (onSave && formData) {
      // Convert uvc_hours to a number
      const hours = formData.uvc_hours ? parseFloat(formData.uvc_hours) : 0;
      
      console.log(`UVCDetailsDialog - Saving UVC hours for unit ${unit.id}: ${hours}`);
      
      onSave({
        ...formData,
        uvc_hours: hours,
      });
    }
  };

  if (!unit || !formData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto bg-spotify-darker border-spotify-accent">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              {unit.name} - UVC Details
            </DialogTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 px-2 text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {lastUpdated && (
            <p className="text-xs text-gray-400">Last updated: {lastUpdated}</p>
          )}
        </DialogHeader>

        {isLoading ? (
          <UVCDialogLoader />
        ) : (
          <div className="space-y-4 mt-3">
            <UVCProgressBar hours={formData.uvc_hours} />
            <UVCDialogForm formData={formData} setFormData={setFormData} />
            <UVCDialogActions 
              onCancel={() => onOpenChange(false)} 
              onSave={handleSave}
              isSaving={isSaving} 
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
